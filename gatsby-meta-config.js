module.exports = {
  title: `Be.Insight.Coder`,
  description: `인문학적, 소통을 중시하는 개발자 류한솔의 기술 블로그입니다.`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://paul2021-r.github.io/`,
  ogImage: `og-image.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `Paul2021-R/Paul2021-R.github.io`, // `zoomkoding/zoomkoding-gatsby-blog`,
    },
  },
  ga: `G-YDPMMYNR6Y`, // Google Analytics Tracking ID
  author: {
    name: `류한솔`,
    bio: {
      role: `야생의 개발자`,
      description: ['사람답게 만들고', '스스로 질문하며', '소통을 중시하는'],
      thumbnail: 'profile.png', // Path to the image in the 'asset' folder
    },
    social: {
      github: `https://github.com/Paul2021-R`, // `https://github.com/zoomKoding`,
      linkedIn: `https://www.linkedin.com/in/hansol-ryu-371581163`, // `https://www.linkedin.com/in/jinhyeok-jeong-800871192`,
      email: `ryu.axel@gmail.com`, // `zoomkoding@gmail.com`,
    },
  },

  // metadata for About Page
  about: {
    timestamps: [
      // =====       [Timestamp Sample and Structure]      =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
      {
        date: '',
        activity: '',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      {
        date: '2021.09 ~ 10',
        activity: '42 Seoul Lapiscine',
        links: {
          post: 'https://42seoul.kr/seoul42/main/view',
          github: '',
          demo: '',
        },
      },
	  {
        date: '2021.11.08',
        activity: '42 Seoul Lapiscine 통과, 5기 최종 합격',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
	  {
        date: '2022.03.12',
        activity: '실전 기술블로그 런칭',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
	  {
        date: '2022.05.06 ~',
        activity: 'Project peer 진행 중',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
	  {
        date: '2022.10.05',
        activity: '42 Seoul 공통과정 돌파',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
    ],

    projects: [
      // =====        [Project Sample and Structure]        =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
      {
        title: '',
        description: '',
        techStack: ['', ''],
        thumbnailUrl: '',
        links: {
          post: '',
          github: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
      // ========================================================
      {
        title: '개발 블로그 테마 적용',
        description:
          '기술 블로그 운영 및 향후 프로젝트 쇼케이스 용으로 활용할 기술블로그 적용 및 최적화를 진행하였습니다. Mac M1 Processor에 호환되지 않은 요소들이 많았기에 해당 호환성 개선, Favicon update, profile image,utterance 적용, Gatsby를 활용한 정적 페이지 생성을 완료.',
        techStack: ['gatsby', 'react', 'Java Script'],
        thumbnailUrl: 'blog.png',
        links: {
          post: '',
          github: 'https://github.com/Paul2021-R/Paul2021-R.github.io',
          demo: '',
        },
      },
	  {
        title: 'Minishell',
        description:
          '최초 팀 프로젝트입니다. Terminal 시스템을 이해하고 Bash 구조를 모사하여 간단한 쉘을 구현하였습니다.',
        techStack: ['C', 'pipe', 'fork', 'execve', 'readline'],
        thumbnailUrl: 'ftshell.png',
        links: {
          post: '',
          github: 'https://github.com/Eingerjar/Minishell',
          demo: '',
        },
      },
	  {
        title: 'cub3D',
        description:
          '2D 구조를 3D로 변환하여, DOOM과 같은 게임을 구현하는 프로젝트입니다. Raycasting을 이용하여 구현하였습니다.',
        techStack: ['C', 'MinilibX', 'Raycasting', 'BMP'],
        thumbnailUrl: 'cub3d.png',
        links: {
          post: '',
          github: 'https://github.com/SeongMinJin/cub3D',
          demo: '',
        },
      },	
	  {
        title: 'webserv',
        description:
          'HTTP/1.1 기반의 웹서버를 구현하는 프로젝트입니다. CGI, Static Web Page, GET, POST, DELETE 의 메서드를 구현하고, HTTP 통신이 가능한 멀티 포트 서버를 구축하였습니다.',
        techStack: ['C++', 'Socket Programming', 'Kevent', 'CGI', 'HTTP'],
        thumbnailUrl: 'webserv.png',
        links: {
          post: '',
          github: 'https://github.com/webservVer2-0/webServ',
          demo: '',
        },
      },
	  {
        title: 'ft_transcendence',
        description:
          'TypeScript, React, NextJs, NestJS 를 활용하여 구축한 SPA. 웹개발 기초 레퍼런스를 제작해보았으며 OAuth를 비롯한 JWT 인증 방식, 채팅 서버, Socket.io를 활용한 실시간 게임 서버 구축 등을 경험하였습니다. ',
        techStack: ['TypeScript', 'NextJs', 'NestJS', 'React', 'PostgressDB', 'Docker-compose'],
        thumbnailUrl: 'fttranscendence.png',
        links: {
          post: '',
          github: 'https://github.com/orgs/Gaepo-transcendance-fighters/repositories',
          demo: '',
        },
      },
	{
        title: 'Project peer-web-application',
        description:
          '동료학습을 위한 기능들과 인공지능을 활용한 개인의 성향-업무성향의 정량 평가 알고리즘을 구축하여 협업 스터디, 협업 프로젝트를 위한 Progressive Web Application 구축을 진행하고 있습니다.',
        techStack: ['TypeScript', 'NextJs', 'Java', 'Spring', 'Boot', 'Redis', 'MySQL', 'MongoDB', 'NHN Cloud'],
        thumbnailUrl: 'peer2.png',
        links: {
          post: '',
          github: 'https://github.com/peer-42seoul',
          demo: '',
        },
      },		
    ],
  },
};
