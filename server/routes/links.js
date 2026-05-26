import { Router } from 'express'

const router = Router()

// 获取所有链接
router.get('/all', (req, res) => {
  const db = req.app.get('db')
  const rows = db.prepare(`
    SELECT l.*, s.name as subcategory_name, s.category_id
    FROM links l
    LEFT JOIN subcategories s ON l.subcategory_id = s.id
    ORDER BY l.sort_order ASC, l.id ASC
  `).all()
  res.json(rows)
})

// 获取某子分类下的链接
router.get('/', (req, res) => {
  const db = req.app.get('db')
  const { subcategoryId } = req.query
  if (!subcategoryId) return res.json([])
  const rows = db.prepare(`
    SELECT l.*, s.name as subcategory_name
    FROM links l
    LEFT JOIN subcategories s ON l.subcategory_id = s.id
    WHERE l.subcategory_id = ?
    ORDER BY l.sort_order ASC, l.id ASC
  `).all(subcategoryId)
  res.json(rows)
})

// 创建链接
router.post('/', (req, res) => {
  const db = req.app.get('db')
  const { subcategory_id, title, url, description, icon, sort_order } = req.body
  if (!subcategory_id || !title || !url) return res.status(400).json({ error: '参数不完整' })
  const result = db.prepare('INSERT INTO links (subcategory_id, title, url, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
    .run(subcategory_id, title, url, description || '', icon || '', sort_order || 0)
  res.json({ id: result.lastInsertRowid, subcategory_id, title, url, description: description || '', icon: icon || '', sort_order: sort_order || 0 })
})

// 更新链接
router.put('/:id', (req, res) => {
  const db = req.app.get('db')
  const { subcategory_id, title, url, description, icon, sort_order } = req.body
  if (!title || !url) return res.status(400).json({ error: '标题和链接不能为空' })
  db.prepare('UPDATE links SET subcategory_id = ?, title = ?, url = ?, description = ?, icon = ?, sort_order = ? WHERE id = ?')
    .run(subcategory_id, title, url, description || '', icon || '', sort_order || 0, req.params.id)
  res.json({ success: true })
})

// 删除链接
router.delete('/:id', (req, res) => {
  const db = req.app.get('db')
  db.prepare('DELETE FROM links WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
