import qs from 'qs'
import { message } from '~/plugins/element-ui'

export default ({ app, $axios, store, redirect, req, error }) => {
  $axios.onRequest(config => {
    config.baseURL = store.state.url.api
    config.timeout = 10000
    config.withCredentials = false
    config.headers.common['Content-Type'] = `application/x-www-form-urlencoded`
    const { method, data } = config
    if (method === 'post') {
      config.data = qs.stringify(app.$sign.prodata(data))
    } else if (method === 'get') {
      config.data = app.$sign.prodata(data)
    }
  })
  $axios.onResponse(response => {
    if (Number(response.data.code) === 1002) {
      message('登录失效，请重新登录！')
      store.commit('TOKENVERIFY', {
        loginState: 0
      })
      redirect('/')
    }
    if (Number(response.data.code) !== 1000) {
      message(response.data.msg)
    }
    return response.data.data ? response.data : response
  })
  // $axios.onError(err => {
  //   console.error('err', err)
  // })
}
