import Vue from 'vue'
import Vuex from 'vuex'
import { getCookies } from '~/plugins/cookies.js'

Vue.use(Vuex)

const testApi = {
  api: 'http://dev.api.course.zejicert.cn/',
  ws: 'ws://edutest.zejicert.cn:8888',
  http: 'http://dev.live.zejicert.cn/',
  ucapi: 'http://dev.api.uc.zejicert.cn/',
  uchttp: 'http://dev.uc.zejicert.cn',
  faceurl: 'http://source.dev.zejicert.cn/static/face/',
  school: 'http://edutest.zejicert.cn'
}

const proApi = {
  api: 'http://api.course.zejicert.cn/',
  ws: 'ws://www.zejicert.cn:8888',
  http: 'http://live.zejicert.cn/',
  ucapi: 'http://api.uc.zejicert.cn/',
  uchttp: 'http://uc.zejicert.cn',
  faceurl: 'http://cdn.zejicert.cn/static/face/',
  school: 'http://www.zejicert.cn'
}

const store = () =>
  new Vuex.Store({
    state: {
      url: process.env.ZEJI_ENV !== 'produce' ? testApi : proApi,
      loginState: 0,
      user_id: 0,
      token: 0,
      userInfo: 0,
      topCate: {}
      // 0 未登录 1 已登录
    },
    mutations: {
      TOKENVERIFY (state, data) {
        state.loginState = data.loginState
        if (data.loginState === 1) {
          state.user_id = data.user_id
          state.token = data.token
        } else {
          state.user_id = ''
          state.token = ''
          !process.server && this.$cookies.remove('ssotoken', { domain: '.zejicert.cn' })
        }
      },
      // 储存用户信息
      SAVEUSERINFO (state, info) {
        if (info && info.id) {
          state.userInfo = info
        }
      },
      // 配置信息
      TOPCATE (state, info) {
        state.topCate = info
      }
    },
    actions: {
      nuxtServerInit ({ dispatch, commit, state }, { app, req }) {
        dispatch('getTopCate')
        const { ssotoken = '' } = getCookies((process.server ? req.headers.cookie : document.cookie) || '')
        let ssotokenData = {}
        if (ssotoken && ssotoken.split('.').length === 2) {
          const ssotokenArr = ssotoken.split('.')
          ssotokenData = {
            user_id: ssotokenArr[0],
            token: ssotokenArr[1]
          }
          commit('TOKENVERIFY', {
            loginState: 1,
            ...ssotokenData
          })
          return dispatch('userInfo', ssotokenData)
        }
      },
      userInfo ({ commit, state }, ssotoken) {
        return this.$axios
          .$post(state.url.ucapi + 'user/userInfo', ssotoken)
          .then(res => {
            commit('SAVEUSERINFO', res)
          }).catch()
      },
      getTopCate ({ commit, state }) {
        return this.$axios
          .$post('api/Live/commonConfig')
          .then(res => {
            commit('TOPCATE', res.topCate)
          }).catch()
      }
    }
  })

export default store
