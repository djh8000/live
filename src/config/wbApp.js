import cookie from './cookie'
import url from './url'

var appPublic = JSON.parse(cookie.get('appPublic'))
// webview 高度交互
export function homePage (to) {
  if (appPublic) {
    // ios传参交互
    if (Number(appPublic.platform) === 1) {
      if (to.name !== 'home') {
        window.webkit.messageHandlers.homePage.postMessage('0')
      } else {
        window.webkit.messageHandlers.homePage.postMessage('1')
      }
    // 安卓传参交互
    } else if (Number(appPublic.platform) === 2) {
      if (to.name !== 'home') {
        window.ZJTK.homePage('0')
      } else {
        window.ZJTK.homePage('1')
      }
    }
  }
}

// webview 登录失效交互
export function loginLose () {
  var fromUrl = window.location.href
  if (appPublic) {
    // ios传参交互
    if (Number(appPublic.platform) === 1) {
      window.webkit.messageHandlers.loginLose.postMessage(fromUrl)
    // 安卓传参交互
    } else if (Number(appPublic.platform) === 2) {
      window.ZJTK.loginLose(fromUrl)
    }
  } else {
    fromUrl = encodeURIComponent(fromUrl)
    window.location.href = url.uchttp + '?fromUrl=' + fromUrl
  }
}

// webview 返回交互
// export function wbBack () {
//   window.history.go(-1)
//   let route = JSON.parse(sessionStorage.getItem('VUE_NAVIGATION')).length
//   if (appPublic && route === 1) {
//     // ios传参交互
//     if (Number(appPublic.platform) === 1) {
//       window.webkit.messageHandlers.wbBack.postMessage('')
//     // 安卓传参交互
//     } else if (Number(appPublic.platform) === 2) {
//       window.ZJTK.wbBack()
//     }
//   }
// }

// webview 资料下载交互
export function materialDownload (URL) {
  if (appPublic) {
    // ios传参交互
    if (Number(appPublic.platform) === 1) {
      window.webkit.messageHandlers.materialDownLoad.postMessage(URL)
    } else {
      window.location.href = URL
    }
  } else {
    window.location.href = URL
  }
}
// banner 跳转
export function jumpType (myurl) {
  let mateUrl = url.http
  if (myurl.indexOf(mateUrl) >= 0) {
    let start = mateUrl.length - 1
    let end = myurl.indexOf('VNK')
    if (end >= 0) {
      myurl = myurl.substring(start, end)
    } else {
      myurl = myurl.substring(start, myurl.length)
    }
    if (appPublic) {
      // app
      return {
        ifOut: false,
        myurl: myurl
      }
    } else {
      // 非app
      return {
        ifOut: false,
        myurl: myurl
      }
    }
  } else {
    if (appPublic) {
      // app
      return {
        ifOut: true,
        myurl: ''
      }
    } else {
      // 非app
      return {
        ifOut: true,
        myurl: myurl
      }
    }
  }
}
// 我的作业 homework（题库app）
export function homework (jumpUrl) {
  if (appPublic) {
    // ios传参交互
    if (Number(appPublic.platform) === 1) {
      window.webkit.messageHandlers.goTikuHomework.postMessage('')
    // 安卓传参交互
    } else if (Number(appPublic.platform) === 2) {
      window.ZJTK.jumpHomeWork()
    }
  } else {
    window.location.href = jumpUrl
  }
}
// 我的作业 （除题库外app）
export function eduHomework (jumpUrl) {
  if (appPublic) {
    // ios传参交互
    if (Number(appPublic.platform) === 1) {
      window.webkit.messageHandlers.goTiku.postMessage('')
    // 安卓传参交互
    } else if (Number(appPublic.platform) === 2) {
      window.ZJTK.goTiku()
    }
  } else {
    window.location.href = jumpUrl
  }
}
