import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Element from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css'

import VeeValidate from 'vee-validate';


import '@/assets/css/my.scss'

// const { Notification } = require('electron')


// Validator.localize('zh_CN', zh_CN);
Vue.use(VeeValidate,{
  inject:true,
  local:'zh_CN',
  classes:true,
  classNames:{
    valid:'is-success',
    invalid:'is-error'
  },
  fieldsBagName: 'vee-fields'
})

Vue.use(Element,{
  size:'small'
})

Vue.config.productionTip = false

Vue.prototype.SystemNotification = function(title,body){
  new window.Notification(title,{
    title:title?title:'标题',
    body:body?body:'内容'
  });
  // notification.show();
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
