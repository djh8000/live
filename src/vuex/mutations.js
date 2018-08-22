export default{
  // 储存user_id,token
  // SAVEUSER (state, user) {
  //   state.user_id = user.user_id
  //   state.token = user.token
  //   state.isLogin = true
  //   localStorage.setItem('isLogin', true)
  //   localStorage.setItem('user_id', user.user_id)
  //   localStorage.setItem('token', user.token)
  // },
  // 储存用户信息
  // USERINFO (state, info) {
  //   state.userMsg = info
  // },
  setPageYOffset (state, val) {
    state.pageYOffset = val
  },
  TOPCATE (state, val) {
    state.topCate = val
  }
}
