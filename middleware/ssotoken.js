export default ({ app, store }) => {
  if (!process.server) {
    const { loginState } = store.state
    if (loginState === 2) {
      store.commit('TOKENVERIFY', {
        loginState: 0
      })
    }
  }
}
