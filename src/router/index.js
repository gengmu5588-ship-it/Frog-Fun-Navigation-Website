import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/Login.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'categories', name: 'Categories', component: () => import('../views/admin/Categories.vue') },
      { path: 'subcategories', name: 'Subcategories', component: () => import('../views/admin/Subcategories.vue') },
      { path: 'links', name: 'Links', component: () => import('../views/admin/Links.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next({ path: '/admin/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
