import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器：自动带上token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401时清除token并跳转登录
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_username')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// 分类
export const getCategories = () => api.get('/categories')
export const getCategory = (id) => api.get(`/categories/${id}`)
export const createCategory = (data) => api.post('/categories', data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// 子分类
export const getSubcategories = (categoryId) => api.get('/subcategories', { params: { categoryId } })
export const createSubcategory = (data) => api.post('/subcategories', data)
export const updateSubcategory = (id, data) => api.put(`/subcategories/${id}`, data)
export const deleteSubcategory = (id) => api.delete(`/subcategories/${id}`)

// 链接
export const getLinks = (subcategoryId) => api.get('/links', { params: { subcategoryId } })
export const getAllLinks = () => api.get('/links/all')
export const createLink = (data) => api.post('/links', data)
export const updateLink = (id, data) => api.put(`/links/${id}`, data)
export const deleteLink = (id) => api.delete(`/links/${id}`)

// 导航页数据
export const getNavData = () => api.get('/nav-data')

// 认证
export const login = (data) => api.post('/auth/login', data)
export const verifyToken = () => api.get('/auth/verify')
export const changePassword = (data) => api.post('/auth/change-password', data)

export default api
