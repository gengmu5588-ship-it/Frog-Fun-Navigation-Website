import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

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

export default api
