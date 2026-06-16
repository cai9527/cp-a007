import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import zhCN from 'element-ui/lib/locale/lang/zh-CN'
import './styles/global.scss'
import setupDirectives from '@/directives/hasPermi'
import { setupComponents } from '@/components'

Vue.config.productionTip = false

Vue.use(ElementUI, { locale: zhCN, size: 'small' })
setupDirectives()
setupComponents(Vue)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
