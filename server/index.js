import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import categoriesRouter from './routes/categories.js'
import subcategoriesRouter from './routes/subcategories.js'
import linksRouter from './routes/links.js'
import navDataRouter from './routes/nav-data.js'
import { initDB } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// 初始化数据库
const db = new Database(path.join(__dirname, 'data.db'))
db.pragma('journal_mode = WAL')
initDB(db)

// 将 db 实例挂到 app 上
app.set('db', db)

// 路由
app.use('/api/categories', categoriesRouter)
app.use('/api/subcategories', subcategoriesRouter)
app.use('/api/links', linksRouter)
app.use('/api/nav-data', navDataRouter)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
