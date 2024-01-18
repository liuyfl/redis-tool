import Vue from 'vue'
import VueRouter from 'vue-router'

import Layout from '@/views/layout'

Vue.use(VueRouter)

  const routes = [
    {
        path:'/',
        component:Layout
    }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
