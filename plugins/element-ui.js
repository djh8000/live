import Vue from 'vue'

import {
  Breadcrumb,
  BreadcrumbItem,
  Tabs,
  TabPane,
  Pagination,
  Input,
  Button,
  Select,
  Form,
  FormItem,
  Option,
  Message,
  Popover,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Loading,
  Dialog,
  Autocomplete
} from 'element-ui'

export const message = (...args) => {
  if (!process.server) {
    Message(...args)
  }
}

export default () => {
  Vue.use(Breadcrumb)
  Vue.use(BreadcrumbItem)
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.use(Pagination)
  Vue.use(Input)
  Vue.use(Button)
  Vue.use(Select)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Option)
  Vue.use(Dropdown)
  Vue.use(DropdownMenu)
  Vue.use(DropdownItem)
  Vue.use(Loading.directive)
  Vue.use(Popover)
  Vue.use(Dialog)
  Vue.use(Autocomplete)
  Vue.prototype.$msg = Message
}
