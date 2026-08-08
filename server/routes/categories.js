import { Router } from 'express'

const router = Router()

// 获取所有分类（含子分类嵌套）
router.get('/', (req, res) => {
  const db = req.app.get('db')
  const rows = db.prepare(`
    SELECT c.id, c.name, c.icon, c.sort_order,
           s.id as sub_id, s.name as sub_name, s.sort_order as sub_sort
    FROM categories c
    LEFT JOIN subcategories s ON s.category_id = c.id
    ORDER BY c.sort_order ASC, c.id, s.sort_order ASC, s.id
  `).all()

  const map = {}
  const list = []
  for (const row of rows) {
    if (!map[row.id]) {
      map[row.id] = {
        id: row.id,
        name: row.name,
        icon: row.icon,
        sort_order: row.sort_order,
        subcategories: []
      }
      list.push(map[row.id])
    }
    if (row.sub_id) {
      map[row.id].subcategories.push({
        id: row.sub_id,
        name: row.sub_name,
        sort_order: row.sub_sort
      })
    }
  }
  res.json(list)
})

// 获取单个分类
router.get('/:id', (req, res) => {
  const db = req.app.get('db')
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
  if (!cat) return res.status(404).json({ error: '分类不存在' })
  res.json(cat)
})

// 创建分类
router.post('/', (req, res) => {
  const db = req.app.get('db')
  const { name, icon, sort_order } = req.body
  if (!name) return res.status(400).json({ error: '分类名称不能为空' })
  const result = db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)').run(name, icon || '', sort_order || 0)
  res.json({ id: result.lastInsertRowid, name, icon: icon || '', sort_order: sort_order || 0 })
})

// 更新分类
router.put('/:id', (req, res) => {
  const db = req.app.get('db')
  const { name, icon, sort_order } = req.body
  if (!name) return res.status(400).json({ error: '分类名称不能为空' })
  db.prepare('UPDATE categories SET name = ?, icon = ?, sort_order = ? WHERE id = ?').run(name, icon || '', sort_order || 0, req.params.id)
  res.json({ success: true })
})

// 删除分类
router.delete('/:id', (req, res) => {
  const db = req.app.get('db')
  // 级联删除子分类和链接
  const subIds = db.prepare('SELECT id FROM subcategories WHERE category_id = ?').all(req.params.id).map(s => s.id)
  if (subIds.length) {
    db.prepare(`DELETE FROM links WHERE subcategory_id IN (${subIds.map(() => '?').join(',')})`).run(...subIds)
  }
  db.prepare('DELETE FROM subcategories WHERE category_id = ?').run(req.params.id)
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
