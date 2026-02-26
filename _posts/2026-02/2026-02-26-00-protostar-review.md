---
layout: post 
title: Protostar review note - 10 - NestJS Auth Domain
subtitle: Protostar 구성 요소들에 대한 복습 + 심도 있는 확장을 정리한다 
categories: 문제해결
tags: Backend 개발 Protostar Project Review NestJS AI 
thumb: https://paul2021-r.github.io/assets/images/assets/protostar-icon.png
custom-excerpt: Protostar 구성 요소들에 대한 복습 + 심도 있는 확장을 정리한다 
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2026-01/20260109-010.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---


# NestJS Auth 도메인 분석

> 이 파일은 인증(Authentication) 전체를 담당하는 Auth 도메인을 다룬다.
>
> | 파일 | 역할 |
> |---|---|
> | `auth.controller.ts` | signup / signin 엔드포인트 노출 |
> | `auth.service.ts` | 회원가입·로그인 비즈니스 로직 |
> | `auth.module.ts` | JwtModule 비동기 설정, 모듈 조립 |
> | `dto/signup.dto.ts` | 회원가입 요청 유효성 검증 |
> | `dto/signin.dto.ts` | 로그인 요청 유효성 검증 |
> | `dto/user.dto.ts` | DB User → 응답 변환, password 제거 |
> | `common/strategy/jwt.strategy.ts` | Passport JWT 검증 전략 |
> | `common/guards/jwt-auth.guard.ts` | 전역 JWT 인증 가드 |

---

# 1. 주요 개념

## 인증 vs 인가

| 구분 | 영어 | 이 프로젝트에서의 구현 |
|---|---|---|
| **인증** (Authentication) | "너 누구야?" | JWT 토큰 검증, bcrypt 비밀번호 비교 |
| **인가** (Authorization) | "너 이거 해도 돼?" | Role enum (ADMIN / STARGAZER / PROTOSTAR) + roleKey |

현재 코드에서 인가(Role 기반 접근 제어)는 회원가입 시 ADMIN 역할 부여에만 적용되어 있고, 엔드포인트별 Role 가드는 구현되어 있지 않다.

## Stateless JWT

```typescript
// JwtStrategy.validate()
async validate(payload: JwtPayload): Promise<Partial<User>> {
  // stateless: DB 조회 없이 토큰 payload만으로 유저 정보 반환
  return { id: payload.sub, email: payload.email, role: payload.role };
}
```

토큰이 유효하면 DB를 거치지 않고 payload에서 바로 유저 정보를 꺼낸다. 장점은 빠른 인증(DB I/O 없음)이고, 단점은 토큰 발급 후 계정 정지·역할 변경 등이 즉시 반영되지 않는다는 점이다.

## Role 기반 접근 제어 (RBAC)

```typescript
enum Role {
  ADMIN       // 관리자 (roleKey 필요)
  STARGAZER   // 일반 사용자 (기본값)
  PROTOSTAR   // 프리미엄 사용자
}
```

ADMIN 회원가입 시 `roleKey`라는 비밀 키를 함께 제출해야 한다. 이는 관리자 계정 무단 생성을 막는 단순하지만 실용적인 방어 수단이다.

## `@Public()` 데코레이터

Auth 엔드포인트는 로그인 전이므로 JWT 토큰이 없다. 전역 `JwtAuthGuard`를 우회하기 위해 `@Public()`을 붙인다.

```typescript
@Public()   // JwtAuthGuard 전역 인증 우회
@Post('signup')
async signup(@Body() dto: SignupDto) { ... }
```

---

# 2. 핵심 로직 흐름

## 전체 Auth 흐름

```
[회원가입]
Client → POST /api/v1/auth/signup
  │
  ├─ ValidationPipe: SignupDto 검증
  │    @IsEmail / @MinLength(8) / @IsEnum(Role) / @IsOptional
  │
  ├─ AuthService.signup()
  │    ├─ prisma.user.findUnique({ email })  ← 중복 이메일 체크
  │    ├─ role === ADMIN → roleKey 검증 (ConfigService.get('ROLE_KEY'))
  │    ├─ bcrypt.hash(password, 10)          ← 비밀번호 해싱
  │    └─ prisma.user.create(...)            ← DB 저장
  │
  └─ return new UserDto(user)               ← password @Exclude 응답

[로그인]
Client → POST /api/v1/auth/signin
  │
  ├─ ValidationPipe: SigninDto 검증
  │
  ├─ AuthService.signin()
  │    ├─ prisma.user.findUnique({ email })  ← 유저 조회
  │    ├─ bcrypt.compare(password, hash)     ← 비밀번호 검증
  │    └─ jwtService.sign({ sub, email, role }) ← JWT 발급
  │
  └─ return { user: UserDto, accessToken }

[이후 모든 요청]
Client → Authorization: Bearer <token>
  │
  └─ JwtAuthGuard → JwtStrategy.validate(payload)
       → request.user = { id, email, role }
       → @ValidateUser() 로 꺼내서 사용
```

## `auth.module.ts` - JwtModule 비동기 설정

```typescript
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<JwtModuleOptions> => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get<string>('JWT_EXPIRATION')),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],   // JwtModule export → 다른 모듈에서 JwtService 사용 가능
})
export class AuthModule {}
```

## SignupDto 검증 흐름

```typescript
export class SignupDto {
  @IsEmail()               // 이메일 형식 검증 (RFC 5322)
  email: string;

  @IsString()
  @MinLength(8)            // 최소 8자 (brute force 최소 방어)
  password: string;

  @IsOptional()            // 없으면 DB default(STARGAZER) 적용
  @IsEnum(Role)            // 'ADMIN' | 'STARGAZER' | 'PROTOSTAR' 외 값 차단
  role?: Role;

  @IsOptional()
  @IsString()
  roleKey?: string;        // ADMIN 역할 신청 시 비밀 키
}
```

`ValidationPipe({ whitelist: true })`와 함께 동작하므로, 위 필드 외의 값은 자동 제거된다.

## ADMIN roleKey 검증 흐름

```typescript
async signup(dto: SignupDto) {
  if (role === Role.ADMIN) {
    if (roleKey !== this.configService.get<string>('ROLE_KEY')) {
      this.logger.warn(`Failed admin signup attempt for ${email}`);
      throw new ForbiddenException('Invalid Admin role key');
    }
  }
}
```

- ADMIN 이외 역할(STARGAZER, PROTOSTAR)은 roleKey 없이 가입 가능
- 키가 틀릴 경우 `ForbiddenException(403)` 반환
- 시도 자체를 `logger.warn`으로 기록 → Loki로 수집되어 이상 접근 감지 가능

## UserDto - 응답에서 password 제거

```typescript
export class UserDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() name?: string;
  @Exclude() password: string;   // ClassSerializerInterceptor가 직렬화 시 제거
  @Expose() role: Role;
  @Expose() createdAt: Date;

  constructor(dto: User) {
    this.id = dto.id;
    this.email = dto.email;
    this.password = dto.password;  // 할당은 하되, 직렬화 시 자동 제거
    this.name = dto.name || undefined;
    this.role = dto.role;
    this.createdAt = dto.createdAt;
  }
}
```

> [!note] 왜 할당하고 @Exclude 하는가
> TypeScript strict 모드에서 `password`를 초기화하지 않으면 컴파일 에러가 발생한다.
> 생성자에서 할당은 하되, `ClassSerializerInterceptor`가 JSON 직렬화 시 `@Exclude()` 필드를 제거한다.
> 응답 JSON에는 절대 포함되지 않는다.

---

# 3. 구조적 취약점 / 개선 방향

## [AuthController] Logger가 선언만 되고 사용되지 않음

```typescript
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  // 실제 사용 없음
}
```

컨트롤러에서 로그를 남기지 않는다. 회원가입·로그인 시도(성공/실패 모두)는 보안 감사(Audit Log) 관점에서 기록이 필요하다. 현재는 `AuthService`에서 ADMIN 실패만 warn으로 남기고 있다.

## [SignupDto] 비밀번호 복잡도 검증 없음

```typescript
@MinLength(8)
password: string;
// MaxLength, 특수문자, 대소문자 조합 등 미검증
```

최소 길이(8자)만 검증한다. 프로덕션에서는 `@Matches(/정규식/)` 또는 별도 검증 로직으로 복잡도를 강제해야 한다.

**개선 예시:**
```typescript
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
  message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다',
})
password: string;
```

## [AuthService] ADMIN roleKey 평문 비교

```typescript
if (roleKey !== this.configService.get<string>('ROLE_KEY')) { ... }
```

환경변수의 roleKey를 평문으로 직접 비교한다. 타이밍 공격(Timing Attack) 가능성이 이론적으로 존재하지만, 이 키는 비밀번호가 아니라 정적 관리자 키이므로 실용적 위험도는 낮다. `crypto.timingSafeEqual()`로 개선 가능하다.

## [Auth 전체] 토큰 갱신(Refresh Token) 미구현

현재는 `accessToken` 하나만 발급한다. 만료 시 재로그인이 필요하다. 프로덕션 수준에서는 단기 `accessToken` + 장기 `refreshToken` 구조가 표준이다.

```
현재: accessToken (만료 시 재로그인)

개선:
  accessToken  (단기, 15분~1시간)
  refreshToken (장기, 7~30일, DB/Redis에 저장)
  → /auth/refresh 엔드포인트로 갱신
```

## [Auth 전체] 계정 잠금 / 로그인 시도 제한 없음

`bcrypt.compare`가 실패해도 별다른 제한 없이 무제한 시도 가능하다. `ThrottlerGuard`가 전역으로 초당 2000 req를 허용하고 있으므로 Credential Stuffing 공격에 취약하다.

**개선 방향**: Redis에 `login:fail:{email}` 카운터를 두고, N회 초과 시 계정 임시 잠금.

## [JwtModule] expiresIn 타입 변환 주의

```typescript
expiresIn: Number(config.get<string>('JWT_EXPIRATION')),
```

환경변수는 문자열로 읽히므로 `Number()` 변환이 필요하다. 환경변수가 숫자가 아닌 문자열(`'7d'` 같은 값)이 들어오면 `NaN`이 되어 토큰이 즉시 만료된다.

---

# 4. 핵심 메서드 및 라이브러리 함수 설명

## `bcrypt.hash(password, saltRounds)`

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
// saltRounds: 10 → 2^10 = 1024번 반복 해싱
```

- `saltRounds`가 높을수록 안전하지만 연산 비용 증가
- 기본값 10은 일반 서버에서 약 100ms 소요 → 브루트포스 1초에 10회 시도 제한 효과
- **랜덤 salt 자동 생성·포함**: 같은 비밀번호도 매번 다른 해시 생성 → Rainbow Table 공격 방지

## `bcrypt.compare(plaintext, hash)`

```typescript
await bcrypt.compare(password, user.password)  // boolean
```

- **상수 시간(Constant-time) 비교**: 문자열 길이나 내용에 무관하게 항상 동일한 시간 소요
- 일반 `===` 비교는 첫 번째 다른 문자에서 즉시 반환 → 타이밍 공격으로 해시 추론 가능
- `bcrypt.compare`는 이를 방지하도록 설계됨

## `jwtService.sign(payload)`

```typescript
const token = this.jwtService.sign({
  sub: user.id,     // JWT 표준 클레임: subject (유저 ID)
  email: user.email,
  role: user.role,
});
```

- `sub`: JWT 표준에서 주체(subject) 식별자. 유저 ID를 관례상 여기에 넣는다.
- 서명에는 `JWT_SECRET` 환경변수 사용 (HS256 알고리즘)
- 검증 시 `JwtStrategy`가 자동으로 서명 유효성 + 만료 여부를 확인

## `PassportStrategy(Strategy)` - JwtStrategy

```typescript
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Authorization: Bearer <token> 헤더에서 추출
      ignoreExpiration: false,  // 만료된 토큰 거부
      secretOrKey,              // 서명 검증 키
    });
  }

  async validate(payload: JwtPayload): Promise<Partial<User>> {
    return { id: payload.sub, email: payload.email, role: payload.role };
    // 반환값 → request.user 에 자동 세팅
  }
}
```

`validate()`의 반환값이 `request.user`가 된다. 이후 `@ValidateUser()` 커스텀 데코레이터로 꺼내 사용한다.

## `class-validator` 데코레이터

| 데코레이터 | 검증 내용 | 사용처 |
|---|---|---|
| `@IsEmail()` | RFC 5322 이메일 형식 | email 필드 |
| `@IsString()` | 문자열 타입 | password, roleKey |
| `@MinLength(8)` | 최소 8자 | password |
| `@IsEnum(Role)` | 허용된 enum 값만 통과 | role |
| `@IsOptional()` | 필드 없어도 허용 | role, roleKey |

`ValidationPipe`가 이 데코레이터들을 읽어 검증 실패 시 `400 BadRequestException`을 자동 반환한다.

---

# 5. 대체 가능한 라이브러리 및 트레이드오프

## Passport JWT vs 직접 구현

| 방법 | 장점 | 단점 |
|---|---|---|
| **passport-jwt** (현재) | NestJS 공식 통합, 전략 패턴으로 OAuth 등 확장 용이 | 추상화 레이어 많아 흐름 파악 어려움 |
| **jose** | 웹 표준(RFC) 기반, 엣지 환경 지원, 경량 | Passport 생태계 없음, 직접 미들웨어 구현 필요 |
| **jsonwebtoken** | 간단하고 투명한 구현 | 단일 JWT만 지원, 전략 확장 없음 |

> OAuth2, Google/GitHub 소셜 로그인 등을 나중에 추가할 계획이라면 Passport가 유리하다. JWT만 쓸 것이라면 `jose`가 더 현대적인 선택이다.

## bcrypt vs Argon2

| 라이브러리 | 장점 | 단점 |
|---|---|---|
| **bcrypt** (현재) | 가장 검증된 방식, 광범위한 채택 | GPU 병렬 공격에 상대적으로 취약 |
| **Argon2id** | OWASP 1순위 권장, 메모리 하드 함수 (GPU 저항) | 상대적으로 낮은 범용 채택률 |
| **scrypt** | Node.js 내장 지원 | 파라미터 설정 복잡 |

> OWASP Password Storage Cheat Sheet(2024)는 **Argon2id**를 1순위로 권장한다. 신규 프로젝트에서는 `argon2` 패키지 도입이 더 권장된다.

## 토큰 저장 방식

| 방식 | 장점 | 단점 |
|---|---|---|
| **응답 body → 클라이언트 저장** (현재) | 구현 단순 | XSS 공격으로 localStorage 탈취 위험 |
| **HttpOnly Cookie** | XSS 방어 (JS 접근 불가) | CSRF 공격 가능성, SameSite 설정 필요 |
| **Refresh Token Rotation** | 토큰 탈취 감지 가능 | 구현 복잡도 증가 |

---

# 6. 개발자로서 알아야 할 영역

## A. JWT 토큰 구조 이해

JWT는 `Header.Payload.Signature` 세 부분으로 구성된다.

```
eyJhbGciOiJIUzI1NiJ9          ← Header (알고리즘)
.eyJzdWIiOiJ1c2VyLWlkIn0      ← Payload (데이터, Base64, 평문!)
.SflKxwRJSMeKKF2QT4fwpMeJf36  ← Signature (위변조 방지)
```

> [!warning] Payload는 암호화가 아니다
> JWT Payload는 **Base64 인코딩**일 뿐, 누구나 디코딩할 수 있다.
> `email`, `role` 같은 민감하지 않은 정보만 담아야 한다.
> 비밀번호, 개인정보 등을 Payload에 넣으면 안 된다.

이 프로젝트의 Payload: `{ sub: userId, email, role }` → 적절한 수준.

## B. Stateless JWT의 한계와 대응

```
문제 시나리오:
1. 유저 A가 로그인 → accessToken 발급 (7일 유효)
2. 관리자가 유저 A 계정 정지
3. 유저 A는 7일 동안 여전히 API 사용 가능
   → DB는 정지됐지만 토큰은 유효하므로 JwtStrategy가 DB 조회 없이 통과
```

해결 방법:
1. **토큰 만료 시간 단축** (15분) + Refresh Token 구조
2. **Redis 블랙리스트**: 로그아웃/정지된 토큰의 `jti`(JWT ID)를 Redis에 저장, 검증 시 조회
3. **DB 조회 방식으로 전환**: validate()에서 DB 조회 (Stateless 장점 포기)

## C. `@IsEnum(Role)` + Prisma enum 연동

```typescript
// DTO
@IsEnum(Role)  // Prisma가 생성한 Role enum 재사용
role?: Role;

// Prisma schema
enum Role {
  ADMIN
  STARGAZER
  PROTOSTAR
}
```

Prisma가 생성한 `Role` enum을 DTO에서 그대로 사용한다. 스키마가 단일 출처(Single Source of Truth)가 되어 enum 값이 추가되면 DTO까지 자동으로 반영된다.

## D. ValidationPipe와 DTO의 관계

```
Request Body (JSON)
      │
      ▼
ValidationPipe
  1. JSON → SignupDto 클래스 인스턴스로 변환 (transform: true)
  2. 각 @Is* 데코레이터 검증 실행
  3. @IsOptional() 필드는 없어도 통과
  4. whitelist: true → DTO에 없는 필드 제거
  5. 검증 실패 → 400 BadRequestException 자동 반환
      │
      ▼
Controller (@Body() dto: SignupDto)
```

## E. 모듈 exports 설계

```typescript
// auth.module.ts
exports: [AuthService, JwtModule]
```

`JwtModule`을 export하는 이유: 다른 모듈에서 `JwtService`를 주입받아 토큰 발급·검증이 필요할 때를 대비한 것이다. 현재 코드에서 실제로 사용되는 모듈은 없지만, 확장성을 위한 설계이다.

## F. 로그인 실패 응답 보안 원칙

```typescript
// 현재 코드
if (!user || !(await bcrypt.compare(password, user.password))) {
  throw new UnauthorizedException('Invalid credentials');
}
```

이메일이 없는 경우와 비밀번호가 틀린 경우를 **동일한 메시지**로 응답한다. 이는 의도적인 설계다.

"이메일이 존재하지 않습니다" vs "비밀번호가 틀립니다"로 구분하면 공격자가 이메일 존재 여부를 확인하는 **계정 열거 공격(Account Enumeration)**이 가능해진다. 항상 동일한 에러 메시지를 반환해야 한다.

---

# 핵심 요약 카드

> [!abstract] Auth 도메인 흐름 한 줄 요약
> - **signup**: DTO 검증 → 중복 체크 → bcrypt 해싱 → DB 저장 → UserDto 반환
> - **signin**: DTO 검증 → 유저 조회 → bcrypt 비교 → JWT 발급 → UserDto + token 반환
> - **이후 요청**: Bearer token → JwtStrategy.validate() → request.user → @ValidateUser()

> [!abstract] 보안 설계 포인트
> - `@Public()` : Auth 엔드포인트만 전역 JWT 가드 우회
> - ADMIN roleKey : 관리자 계정 무단 생성 방지
> - bcrypt.compare : 상수 시간 비교로 타이밍 공격 방지
> - 동일 에러 메시지 : 계정 열거 공격 방지
> - @Exclude() password : 응답에서 비밀번호 자동 제거

> [!question] 설명할 수 있어야 하는 것
> 1. JWT Payload가 암호화가 아닌 이유와 담아도 되는 정보의 기준
> 2. Stateless JWT의 한계 - 계정 정지가 즉시 반영되지 않는 이유
> 3. `bcrypt.compare`가 `===` 비교보다 안전한 이유
> 4. 로그인 실패 시 이메일/비밀번호 구분 없이 동일 메시지를 주는 이유
> 5. `@IsOptional()` + `@IsEnum(Role)` 조합이 어떻게 동작하는가
> 6. `JwtModule`을 exports에 포함한 이유
