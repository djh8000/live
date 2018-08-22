import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Index = r => require.ensure([], () => r(require('../pages/index')), 'el-home')
const list = r => require.ensure([], () => r(require('../pages/list')), 'el-list')
const searchList = r => require.ensure([], () => r(require('../pages/searchList')), 'el-searchList')
const item = r => require.ensure([], () => r(require('../pages/item')), 'el-item')
const download = r => require.ensure([], () => r(require('../pages/download')), 'el-item')
const room = r => require.ensure([], () => r(require('../pages/liveRoom')), 'el-room')
const liveClassroom = r => require.ensure([], () => r(require('../pages/liveClassroom')), 'el-classroom')
const orderSure = r => require.ensure([], () => r(require('../pages/orderSure')), 'orderSure')
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: __dirname,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index,
      meta: {
        title: '直播中心'
      }
    },
    {
      name: 'list',
      path: '/list',
      component: list,
      meta: {
        title: '全部直播'
      }
    },
    {
      name: 'searchList',
      path: '/searchList',
      component: searchList,
      meta: {
        title: '直播搜索'
      }
    },
    {
      name: 'item',
      path: '/item',
      component: item,
      meta: {
        title: '直播详情'
      }
    },
    {
      name: 'download',
      path: '/download',
      component: download,
      meta: {
        isLogin: true,
        title: '我的资料'
      }
    },
    {
      name: 'liveRoom',
      path: '/liveRoom/:id',
      component: room,
      meta: {
        isLogin: true,
        title: '直播中心'
      }
    },
    {
      name: 'liveClassroom',
      path: '/liveClassroom',
      component: liveClassroom,
      meta: {
        isLogin: true,
        title: '直播教室'
      }
    },
    {
      name: 'orderSure',
      path: '/orderSure',
      component: orderSure,
      meta: {
        isLogin: true,
        title: '订单确认'
      }
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
