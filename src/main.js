// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import './assets/css/common.scss'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './vuex'
import http from './config/http'
import cookie from './config/cookie'
import {homePage, loginLose} from './config/wbApp'
import Navigation from 'vue-navigation'
import 'lib-flexible/flexible.js'
import './config/mint-ui'
import 'mescroll.js/mescroll.min.css'
import MeScroll from 'mescroll.js'

Vue.use(Navigation, {router, store})
Vue.prototype.http = http
Vue.prototype.MeScroll = MeScroll
Vue.prototype.$cookie = cookie
Vue.prototype.iosBuy = cookie.get('formalVersion')

Vue.config.productionTip = false

window.vm = new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App },
  render: h => h(App)
})
// 路由守卫
router.beforeEach((to, form, next) => {
  homePage(to)
  if (to.meta.title) {
    document.title = to.meta.title
  }
  if (to.matched.some(record => record.meta.isLogin)) {
    if (cookie.get('ssotoken') === null) {
      loginLose()
    } else {
      next()
    }
  } else {
    next()
  }
})
