import { Router } from 'express'

const router = Router()

// 获取导航页完整数据（前台使用）
router.get('/', (req, res) => {
  const db = req.app.get('db')

  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all()

  const result = categories.map(cat => {
    const subcategories = db.prepare('SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order ASC, id ASC').all(cat.id)
    return {
      ...cat,
      subcategories: subcategories.map(sub => {
        const links = db.prepare('SELECT * FROM links WHERE subcategory_id = ? ORDER BY sort_order ASC, id ASC').all(sub.id)
        return { ...sub, links }
      })
    }
  })

  res.json({
    config: { title: '聚合导航' },
    categories: result
  })
})

export default router
