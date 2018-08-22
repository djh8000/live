const webpack = require('webpack')

module.exports = {
  head: {
    title: '泽稷直播',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: 'CPA知识点库是泽稷研究院及行业数百位名师耗时数年、联合打造的行业独家产品！经过对CPA历年考试的深入研究,以知识点为单位,以其内在逻辑为核心脉络,打破混乱,重塑框架,全面重新整合CPA教材,旨在帮助学员更好的理解知识点之间内在联系、全面深入透彻掌握CPA考题考点而打造的教育学习类软件。' },
      { name: 'keywords', content: '泽稷网校,泽稷教育,中国注册会计师考试,CPA考试,会计,审计,税法,经济法,战略,财务成本管理,知识点,长期股权投资,题库,课程,合并报表,知识点逻辑,泽稷智题库,CPA练习题,CPA历年真题,审计流程,CPA最新考试大纲,重要考点,高频考点' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { type: 'text/javascript', src: 'https://player.polyv.net/livescript/liveplayer.js'},
      { type: 'text/javascript', src: 'http://player.polyv.net/script/player.js'}
    ]
  },
  css: [
    { src: '~assets/css/base.scss', lang: 'scss' },
    'swiper/dist/css/swiper.css'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#22d3b7' },
  /*
  ** Build configuration
  */
  plugins: [
    '~/plugins/axios',
    '~/plugins/sign',
    '~/plugins/element-ui',
    '~/plugins/cookies',
    '~/plugins/router',
    { src: '~/plugins/vue-swiper', ssr: false }
  ],
  modules: [
    '@nuxtjs/axios'
  ],
  router: {
    scrollBehavior (to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        let position = {}
        // 目标页面子组件少于两个
        if (to.matched.length < 2) {
          // 滚动至页面顶部
          position = { x: 0, y: 0 }
        } else if (to.matched.some((r) => r.components.default.options.scrollToTop)) {
          // 如果目标页面子组件中存在配置了scrollToTop为true
          position = { x: 0, y: 0 }
        }
        // 如果目标页面的url有锚点,  则滚动至锚点所在的位置
        if (to.hash) {
          position = { selector: to.hash }
        }
        return position
      }
    }
  },
  build: {
    /*
    ** Run ESLint on save
    */
    babel: {
      presets: ['env', 'stage-2'],
      plugins: [
        ['transform-runtime'],
        ['component', [
          {
            'libraryName': 'element-ui',
            'styleLibraryName': '~static/css/theme'
          }
        ]]]
    },
    vendor: ['axios', 'element-ui', 'vue-awesome-swiper'],
    maxChunkSize: 500000,
    extend (config, { isDev, isClient }) {
      const sassResourcesLoader = {
        loader: 'sass-resources-loader',
        options: {
          resources: [
            'assets/css/common.scss'
          ]
        }
      }
      // 遍历nuxt定义的loader配置，添加sass公共变量。
      config.module.rules.forEach((rule) => {
        if (rule.test.toString() === '/\\.vue$/') {
          rule.options.loaders.sass.push(sassResourcesLoader)
          rule.options.loaders.scss.push(sassResourcesLoader)
        }
        if (['/\\.sass$/', '/\\.scss$/'].indexOf(rule.test.toString()) !== -1) {
          rule.use.push(sassResourcesLoader)
        }
      })
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
