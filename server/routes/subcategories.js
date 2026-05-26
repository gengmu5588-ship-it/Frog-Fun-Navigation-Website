import { Router } from 'express'

const router = Router()

// 获取子分类列表
router.get('/', (req, res) => {
  const db = req.app.get('db')
  const { categoryId } = req.query
  let rows
  if (categoryId) {
    rows = db.prepare(`
      SELECT s.*, c.name as category_name
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.category_id = ?
      ORDER BY s.sort_order ASC, s.id ASC
    `).all(categoryId)
  } else {
    rows = db.prepare(`
      SELECT s.*, c.name as category_name
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.sort_order ASC, s.id ASC
    `).all()
  }
  res.json(rows)
})

// 创建子分类
router.post('/', (req, res) => {
  const db = req.app.get('db')
  const { category_id, name, sort_order } = req.body
  if (!category_id || !name) return res.status(400).json({ error: '参数不完整' })
  const result = db.prepare('INSERT INTO subcategories (category_id, name, sort_order) VALUES (?, ?, ?)').run(category_id, name, sort_order || 0)
  res.json({ id: result.lastInsertRowid, category_id, name, sort_order: sort_order || 0 })
})

// 更新子分类
router.put('/:id', (req, res) => {
  const db = req.app.get('db')
  const { category_id, name, sort_order } = req.body
  if (!name) return res.status(400).json({ error: '子分类名称不能为空' })
  db.prepare('UPDATE subcategories SET category_id = ?, name = ?, sort_order = ? WHERE id = ?').run(category_id, name, sort_order || 0, req.params.id)
  res.json({ success: true })
})

// 删除子分类
router.delete('/:id', (req, res) => {
  const db = req.app.get('db')
  db.prepare('DELETE FROM links WHERE subcategory_id = ?').run(req.params.id)
  db.prepare('DELETE FROM subcategories WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
