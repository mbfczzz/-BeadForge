import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/Login.vue'), meta: { noAuth: true } },
    {
      path: '/',
      component: () => import('../layout/AdminLayout.vue'),
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '仪表盘' } },
        { path: 'users', component: () => import('../views/Users.vue'), meta: { title: '用户管理' } },
        { path: 'designs', component: () => import('../views/Designs.vue'), meta: { title: '作品管理' } },
        { path: 'products', component: () => import('../views/Products.vue'), meta: { title: '商品管理' } },
        { path: 'patterns', component: () => import('../views/Patterns.vue'), meta: { title: '图纸管理' } },
        { path: 'feeds', component: () => import('../views/Feeds.vue'), meta: { title: '动态管理' } },
        { path: 'api-config', component: () => import('../views/ApiConfig.vue'), meta: { title: 'API配置' } },
      ],
    },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.noAuth && !localStorage.getItem('admin_token')) {
    return '/login'
  }
})

export default router
