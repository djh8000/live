import Vue from 'vue'
import {
  Swipe,
  SwipeItem,
  Button,
  Header,
  Navbar,
  TabItem,
  TabContainer,
  TabContainerItem,
  Toast,
  Picker,
  Popup,
  Indicator,
  InfiniteScroll,
  Spinner} from 'mint-ui'

export default (() => {
  // 轮播
  Vue.component(Swipe.name, Swipe)
  Vue.component(SwipeItem.name, SwipeItem)
  // header
  Vue.component(Header.name, Header)
  // 选项卡
  Vue.component(Navbar.name, Navbar)
  Vue.component(TabItem.name, TabItem)
  Vue.component(TabContainer.name, TabContainer)
  Vue.component(TabContainerItem.name, TabContainerItem)
  // button
  Vue.component(Button.name, Button)
  // 滑动选择
  Vue.component(Picker.name, Picker)
  // 弹出框组件
  Vue.component(Popup.name, Popup)
  // 下拉加载
  Vue.use(InfiniteScroll)
  // loding
  Vue.component(Spinner.name, Spinner)
  Vue.prototype.$msg = function (msg) {
    Toast({
      className: 'msg',
      message: msg,
      duration: 1000
    })
  }
  Vue.prototype.$loding = Indicator
})()
