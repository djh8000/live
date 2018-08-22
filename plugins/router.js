import { message } from '~/plugins/element-ui'

export const requiresAuth = [
  '/liveRoom',
  '/video',
  '/order'
] // 用户权限路由表

export default ({app, store, route}) => {
  app.router.beforeEach((to, from, next) => {
    if (!process.server) {
      const {loginState} = store.state
      if ((loginState !== 1) && to.matched.some(record => requiresAuth.some(e => record.path.indexOf(e) !== -1))) {
        message({
          message: '您还未登录，请登录后继续~~',
          type: 'warning',
          duration: 1000,
          onClose: () => {
            const url = window.location.href
            window.location.href = store.state.url.uchttp + '?fromUrl=' + url
          }
        })
      } else {
        next()
      }
    } else {
      next()
    }
    // 判断是否是ie浏览器
    var userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 // 判断是否IE<11浏览器
    var isEdge = userAgent.indexOf('Edge') > -1 && !isIE // 判断是否IE的Edge浏览器
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
    if (isIE || isEdge || isIE11) {
      var reIE = new RegExp('MSIE (\\d+\\.\\d+);')
      reIE.test(userAgent)
      localStorage.setItem('ifIe', 1)
    } else {
      localStorage.setItem('ifIe', -1)
      // 不是ie浏览器
    }
  })
  app.router.afterEach((to, from) => {
    if (!process.server) {
    }
  })
}
