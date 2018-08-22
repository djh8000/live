import http from '../config/http'
export default{
  // 用户登录
  // userLogin ({dispatch, commit}, data) {
  //   http.post('user/login', data)
  //   .then(res => {
  //     if (res.code === 1000) {
  //       let udata = {
  //         user_id: res.data.user_id,
  //         token: res.data.token
  //       }
  //       dispatch('userInfo', udata).then(() => {
  //         commit('SAVEUSER', res.data)
  //       })
  //     }
  //   })
  // },
  getTopCate ({ commit }) {
    http.post('api/Live/commonConfig').then(res => {
      if (res.code === 1000) {
        commit('TOPCATE', res.data.topCate)
      }
    })
  }
}
