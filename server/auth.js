import crypto from 'crypto'
import { Router } from 'express'

const SECRET = 'nav-site-secret-key-2024'
const TOKEN_EXPIRES = 24 * 60 * 60 * 1000 // 24小时

const DEFAULT_ADMIN = {
  username: 'admin',
  passwordHash: hashPassword('admin123')
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SECRET).digest('hex')
}

function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const exp = Date.now() + TOKEN_EXPIRES
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url')
  const signature = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.')
    const expected = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
    if (signature !== expected) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function authMiddleware(req, res, next) {
  // GET 请求不需要验证（前台也需要读取数据）
  if (req.method === 'GET') return next()
  // 登录接口不需要验证
  if (req.path === '/api/auth/login') return next()

  // 写操作需要验证token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' })
  }
  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
  next()
}

export function createAuthRouter(db) {
  const router = Router()

  // 确保admin表存在
  db.exec(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // 初始化默认管理员
  const count = db.prepare('SELECT COUNT(*) as cnt FROM admin_users').get()
  if (count.cnt === 0) {
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(DEFAULT_ADMIN.username, DEFAULT_ADMIN.passwordHash)
  }

  // 登录
  router.post('/login', (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' })
    }
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username)
    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    const token = generateToken({ id: user.id, username: user.username })
    res.json({ token, username: user.username })
  })

  // 修改密码
  router.post('/change-password', (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '请先登录' })
    }
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({ error: '登录已过期' })
    }
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '请输入旧密码和新密码' })
    }
    const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(payload.id)
    if (!user || user.password_hash !== hashPassword(oldPassword)) {
      return res.status(400).json({ error: '旧密码错误' })
    }
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), user.id)
    res.json({ success: true })
  })

  // 验证token
  router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录' })
    }
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({ error: '登录已过期' })
    }
    res.json({ valid: true, username: payload.username })
  })

  return router
}
