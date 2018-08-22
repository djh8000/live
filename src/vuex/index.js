import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    pageYOffset: 0,
    course: [
      {
        name: '会计',
        id: '1001'
      },
      {
        name: '审计',
        id: '1002'
      },
      {
        name: '税法',
        id: '1003'
      },
      {
        name: '经济法',
        id: '1004'
      },
      {
        name: '财管',
        id: '1005'
      },
      {
        name: '战略',
        id: '1006'
      }
    ],
    topCate: [] // 配置文件
  },
  mutations,
  actions
})
