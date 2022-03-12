module.exports = {
  title: `Paul2021-R.github.io`,
  description: `전지적 사회학적 시점의 Paul`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://paul2021-r.github.io/`,
  ogImage: `profile.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `https://github.com/Paul2021-R/Paul2021-R.github.io`, // `zoomkoding/zoomkoding-gatsby-blog`,
    },
  },
  ga: '0', // Google Analytics Tracking ID
  author: {
    name: `류한솔`,
    bio: {
      role: `야생의 개발자..!`,
      description: ['인문학적', '스스로 질문하는', '소통을 중시하는'],
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
        date: '2021.09 ~',
        activity: '42 Seoul Start!',
        links: {
          post: '',
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
          '기술 블로그 운영 및 향후 프로젝트 쇼케이스 용으로 활용할 기술블로그 적용 및 최적화를 진행하였습니다. Mac Arm에 호환되지 않은 요소들이 많았기에 해당 호환성 개선 및 Gatsby를 활용한 정적 페이지 생성을 완료.',
        techStack: ['gatsby', 'react', 'Java Script'],
        thumbnailUrl: 'blog.png',
        links: {
          post: '',
          github: 'https://github.com/Paul2021-R/Paul2021-R.github.io',
          demo: '',
        },
      },
    ],
  },
};
