import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
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

export default router
