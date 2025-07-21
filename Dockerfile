FROM ruby:3.1

# 기본 패키지 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 생성
RUN mkdir -p /root/workspace

# Jekyll 및 Bundler 설치
RUN gem install jekyll bundler

# 작업 디렉토리 설정
WORKDIR /root/workspace

# 포트 노출
EXPOSE 4000 22

# SSH 서버 시작 및 Jekyll 서버 실행
CMD ["/bin/bash", "-c", "cd /root/workspace && bundle install && bundle exec jekyll serve --host=0.0.0.0"]
