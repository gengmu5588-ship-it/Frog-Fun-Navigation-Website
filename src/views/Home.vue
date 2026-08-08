<template>
  <div class="nav-home" :class="{ dark: isDark }">
    <!-- 侧边栏 -->
    <aside
      class="sidebar"
      :class="{
        collapsed: sidebarCollapsed && !isMobile,
        'mobile-open': mobileMenuOpen
      }"
    >
      <!-- Logo 区域 -->
      <div class="sidebar-logo">
        <span class="logo-icon">🧭</span>
        <span class="logo-text" v-show="!sidebarCollapsed || isMobile">{{ siteConfig.title }}</span>
      </div>

      <!-- 分类导航列表 -->
      <nav class="sidebar-nav">
        <!-- 首页项（全部视图入口） -->
        <div
          class="nav-category nav-home-item"
          :class="{ active: activeCategory === 'home' }"
          @click="goHome"
        >
          <span class="cat-icon">🏠</span>
          <span class="cat-name" v-show="!sidebarCollapsed || isMobile">首页</span>
        </div>

        <!-- 分类列表 -->
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="nav-group"
        >
          <div
            class="nav-category"
            :class="{ active: activeCategory === cat.id }"
            @click="scrollToCategory(cat.id)"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name" v-show="!sidebarCollapsed || isMobile">{{ cat.name }}</span>
            <span
              v-if="cat.subcategories?.length > 1 && (!sidebarCollapsed || isMobile)"
              class="expand-arrow"
              :class="{ expanded: activeCategory === cat.id }"
            >›</span>
          </div>

          <!-- 子分类列表（仅当前激活分类展开，缩进展示） -->
          <transition name="slide">
            <div
              v-if="activeCategory === cat.id && cat.subcategories?.length > 1 && (!sidebarCollapsed || isMobile)"
              class="nav-subcategories"
            >
              <div
                v-for="sub in cat.subcategories"
                :key="sub.id"
                class="nav-sub"
                :class="{ active: activeSubcategory === sub.id }"
                v-show="sub.links && sub.links.length"
                @click.stop="scrollToSubcategory(cat.id, sub.id)"
              >
                {{ sub.name }}
              </div>
            </div>
          </transition>
        </div>
      </nav>

      <!-- 底部管理入口 -->
      <div class="sidebar-footer">
        <a href="/admin" class="admin-link" target="_blank">
          <span class="admin-icon">⚙</span>
          <span v-show="!sidebarCollapsed || isMobile">后台管理</span>
        </a>
      </div>
    </aside>

    <!-- 移动端遮罩 -->
    <div
      v-if="mobileMenuOpen"
      class="sidebar-overlay"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- 主内容区 -->
    <div class="main-area" :class="{ 'sidebar-collapsed': sidebarCollapsed && !isMobile }">
      <!-- 顶部栏 -->
      <header class="main-header">
        <button class="menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
          <span></span><span></span><span></span>
        </button>
        <div class="breadcrumb">
          <span class="current-cat">{{ currentCategoryName }}</span>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到亮色' : '切换到暗色'">
          {{ isDark ? '☀' : '☾' }}
        </button>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          «
        </button>
      </header>

      <!-- 全部链接视图（按分类分区） -->
      <main class="content-body">
        <div v-if="!categoriesWithLinks.length" class="empty-state">暂无数据</div>

        <template v-else>
          <div
            v-for="cat in categoriesWithLinks"
            :key="cat.id"
            :id="`cat-section-${cat.id}`"
            class="cat-section"
          >
            <div class="cat-section-header">
              <span class="cat-section-icon">{{ cat.icon }}</span>
              <span class="cat-section-name">{{ cat.name }}</span>
              <span class="cat-section-count" v-if="cat.allLinks.length">{{ cat.allLinks.length }} 个</span>
            </div>

            <!-- 只有一个子分类：直接平铺 -->
            <div
              v-if="cat.subcategories.length <= 1"
              class="links-grid"
              v-show="cat.allLinks.length"
            >
              <a
                v-for="link in cat.allLinks"
                :key="link.id"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="link-card"
              >
                <div class="link-icon">
                  <img v-if="link.icon" :src="link.icon" :alt="link.title" @error="handleIconError" />
                  <span v-else class="default-icon">{{ link.title?.charAt(0) }}</span>
                </div>
                <div class="link-info">
                  <div class="link-title">{{ link.title }}</div>
                  <div class="link-desc">{{ link.description }}</div>
                </div>
              </a>
            </div>

            <!-- 多个子分类：按子分类分组 -->
            <template v-else>
              <div
                v-for="sub in cat.subcategories"
                :key="sub.id"
                :id="`sub-section-${sub.id}`"
                class="sub-group"
                v-show="sub.links && sub.links.length"
              >
                <div class="sub-group-title">{{ sub.name }}</div>
                <div class="links-grid" v-if="sub.links && sub.links.length">
                  <a
                    v-for="link in sub.links"
                    :key="link.id"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-card"
                  >
                    <div class="link-icon">
                      <img v-if="link.icon" :src="link.icon" :alt="link.title" @error="handleIconError" />
                      <span v-else class="default-icon">{{ link.title?.charAt(0) }}</span>
                    </div>
                    <div class="link-info">
                      <div class="link-title">{{ link.title }}</div>
                      <div class="link-desc">{{ link.description }}</div>
                    </div>
                  </a>
                </div>
              </div>
            </template>

            <div v-if="!cat.allLinks.length" class="empty-state empty-in-section">暂无链接</div>
          </div>
        </template>
      </main>

      <!-- 底部 -->
      <footer class="main-footer">
        <p>Copyright © 2026 视觉志导航. 浙ICP备2026038793号-1. Design by TRAE ide</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getNavData } from '../api'

const siteConfig = ref({ title: '视觉志·导航网' })
const categories = ref([])
// 'home' 表示首页全部视图；否则为分类 id（scroll-spy 高亮项）
const activeCategory = ref('home')
// 当前激活分类下的激活子分类（scroll-spy 高亮项）
const activeSubcategory = ref(null)
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const isMobile = ref(false)
// 标记程序触发的滚动，避免 scroll-spy 抢占
const isProgrammaticScroll = ref(false)
// 暗色模式（localStorage 持久化）
const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  try {
    localStorage.setItem('nav_theme', isDark.value ? 'dark' : 'light')
  } catch (e) {}
}

// 计算每个分类下的全部链接（合并子分类）
const categoriesWithLinks = computed(() => {
  return categories.value.map(cat => {
    const subs = cat.subcategories || []
    const allLinks = subs.flatMap(sub => sub.links || [])
    return { ...cat, subcategories: subs, allLinks }
  })
})

const currentCategoryName = computed(() => {
  if (activeCategory.value === 'home') return '首页'
  const cat = categories.value.find(c => c.id === activeCategory.value)
  return cat ? cat.name : ''
})

// 回到首页（全部视图顶部）
function goHome() {
  activeCategory.value = 'home'
  isProgrammaticScroll.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => { isProgrammaticScroll.value = false }, 1000)
  if (isMobile.value) mobileMenuOpen.value = false
}

// 平滑滚动到指定分类区块
function scrollToCategory(catId) {
  activeCategory.value = catId
  const el = document.getElementById(`cat-section-${catId}`)
  if (el) {
    isProgrammaticScroll.value = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { isProgrammaticScroll.value = false }, 1500)
  }
  if (isMobile.value) mobileMenuOpen.value = false
}

// 平滑滚动到指定子分类区块
function scrollToSubcategory(catId, subId) {
  activeCategory.value = catId
  activeSubcategory.value = subId
  const el = document.getElementById(`sub-section-${subId}`)
  if (el) {
    isProgrammaticScroll.value = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { isProgrammaticScroll.value = false }, 1500)
  }
  if (isMobile.value) mobileMenuOpen.value = false
}

// 滚动监听：自动高亮当前所属分类与子分类（基于视口位置）
function onScroll() {
  if (isProgrammaticScroll.value) return
  // 接近顶部时高亮"首页"
  if (window.scrollY < 40) {
    activeCategory.value = 'home'
    activeSubcategory.value = null
    return
  }
  const offset = 90 // 顶部 header(56) + 间距
  let current = 'home'
  let currentSub = null
  for (const cat of categoriesWithLinks.value) {
    const el = document.getElementById(`cat-section-${cat.id}`)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    // 区块顶部已滚过视口偏移线，则视为当前分类
    if (rect.top - offset <= 0) {
      current = cat.id
      // 在当前分类内进一步定位子分类
      if (cat.subcategories.length > 1) {
        for (const sub of cat.subcategories) {
          if (!sub.links || !sub.links.length) continue
          const subEl = document.getElementById(`sub-section-${sub.id}`)
          if (!subEl) continue
          const subRect = subEl.getBoundingClientRect()
          if (subRect.top - offset <= 0) {
            currentSub = sub.id
          } else {
            break
          }
        }
      }
    } else {
      break
    }
  }
  activeCategory.value = current
  activeSubcategory.value = currentSub
}

function handleIconError(e) {
  e.target.style.display = 'none'
}

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileMenuOpen.value = false
  }
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('scroll', onScroll, { passive: true })
  // 读取主题偏好
  try {
    const saved = localStorage.getItem('nav_theme')
    if (saved === 'dark') isDark.value = true
    else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDark.value = true
    }
  } catch (e) {}
  try {
    const { data } = await getNavData()
    siteConfig.value = data.config || { title: '视觉志·导航网' }
    categories.value = data.categories || []
  } catch (e) {
    console.error('加载数据失败', e)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.nav-home {
  /* 亮色主题变量 */
  --bg-page: #F5F6F8;
  --bg-surface: #FFFFFF;
  --bg-surface-2: #FAFBFC;
  --bg-hover: #F0F1F3;
  --bg-active: #F0F2FF;
  --bg-icon: #F0F2FF;
  --border: #E8ECF0;
  --text-strong: #1F2329;
  --text-base: #646A73;
  --text-muted: #8F959E;
  --accent: #4F6BED;
  --scrollbar: #D0D3D6;
  --shadow: rgba(79, 107, 237, 0.1);
  --overlay: rgba(0, 0, 0, 0.3);
  min-height: 100vh;
  background: var(--bg-page);
  transition: background 0.3s;
}

/* 暗色主题变量覆盖 */
.nav-home.dark {
  --bg-page: #14161A;
  --bg-surface: #1C1F26;
  --bg-surface-2: #181B21;
  --bg-hover: #262A33;
  --bg-active: #2A2F3D;
  --bg-icon: #2A3142;
  --border: #2A2E37;
  --text-strong: #E6E8EC;
  --text-base: #A8AEB8;
  --text-muted: #7A808C;
  --accent: #7B8DFF;
  --scrollbar: #3A3F4A;
  --shadow: rgba(0, 0, 0, 0.3);
  --overlay: rgba(0, 0, 0, 0.5);
}

/* ========== 侧边栏 ========== */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: var(--bg-surface-2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

/* Logo 区域 */
.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar-logo {
  padding: 0;
  justify-content: center;
}

.logo-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
}

/* 导航列表 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--scrollbar);
  border-radius: 2px;
}

.nav-group {
  margin-bottom: 2px;
}

/* 首页项特殊样式：与分类之间加分隔线 */
.nav-home-item {
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}

.sidebar.collapsed .nav-home-item {
  padding-bottom: 10px;
}

.nav-category {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  color: var(--text-base);
  font-size: 14px;
  gap: 10px;
  user-select: none;
}

.sidebar.collapsed .nav-category {
  padding: 10px 0;
  justify-content: center;
}

.nav-category::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: transparent;
  border-radius: 0 2px 2px 0;
  transition: background 0.2s;
}

.nav-category:hover {
  background: var(--bg-hover);
  color: var(--text-strong);
}

.nav-category.active {
  background: var(--bg-active);
  color: var(--accent);
}

.nav-category.active::before {
  background: var(--accent);
}

.cat-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.cat-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 展开箭头 */
.expand-arrow {
  font-size: 16px;
  color: var(--text-muted);
  transition: transform 0.25s ease;
  transform: rotate(0deg);
  margin-left: auto;
  flex-shrink: 0;
  line-height: 1;
}

.expand-arrow.expanded {
  transform: rotate(90deg);
  color: var(--accent);
}

/* 子分类列表容器（缩进展示） */
.nav-subcategories {
  padding: 4px 0 6px 34px;
  margin-bottom: 4px;
}

/* 子分类单项 */
.nav-sub {
  padding: 6px 12px;
  font-size: 13px;
  color: var(--text-base);
  cursor: pointer;
  border-radius: 6px;
  border-left: 2px solid transparent;
  margin-left: 2px;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-sub:hover {
  color: var(--text-strong);
  background: var(--bg-hover);
}

.nav-sub.active {
  color: var(--accent);
  border-left-color: var(--accent);
  background: var(--bg-active);
  font-weight: 500;
}

/* 子分类展开/收起动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-4px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 600px;
}

/* 侧边栏底部 */
.sidebar-footer {
  border-top: 1px solid var(--border);
  padding: 12px 20px;
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar-footer {
  padding: 12px 0;
  text-align: center;
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.admin-link:hover {
  color: var(--accent);
}

.sidebar.collapsed .admin-link {
  justify-content: center;
}

.admin-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* ========== 主内容区 ========== */
.main-area {
  margin-left: 240px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-area.sidebar-collapsed {
  margin-left: 64px;
}

/* 顶部栏 */
.main-header {
  height: 56px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.3s;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.menu-toggle span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--text-strong);
  border-radius: 1px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.current-cat {
  color: var(--text-strong);
  font-weight: 500;
}

/* 主题切换按钮 */
.theme-toggle {
  margin-left: auto;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.collapse-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 14px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* 内容区 */
.content-body {
  flex: 1;
  padding: 20px 24px;
}

/* 分类区块 */
.cat-section {
  margin-bottom: 24px;
  scroll-margin-top: 72px;
}

.cat-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: var(--bg-surface);
  border-radius: 8px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  transition: background 0.3s;
}

.cat-section-icon {
  font-size: 18px;
}

.cat-section-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-strong);
  flex: 1;
}

.cat-section-count {
  font-size: 12px;
  color: var(--text-muted);
}

/* 子分类分组 */
.sub-group {
  margin-bottom: 16px;
}

.sub-group-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-base);
  padding: 4px 4px 8px;
  border-left: 2px solid var(--border);
  padding-left: 8px;
  margin-left: 4px;
  margin-bottom: 8px;
}

/* 链接卡片网格 */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-surface);
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-strong);
  transition: all 0.2s;
  border: 1px solid var(--border);
}

.link-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 12px var(--shadow);
  transform: translateY(-1px);
}

.link-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-icon);
}

.link-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-icon {
  color: var(--accent);
  font-size: 16px;
  font-weight: 600;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-desc {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 14px;
}

.empty-in-section {
  padding: 24px;
}

/* 底部 */
.main-footer {
  padding: 16px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  border-top: 1px solid var(--border);
}

/* ========== 移动端遮罩 ========== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  z-index: 190;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 260px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 260px;
  }

  .main-area,
  .main-area.sidebar-collapsed {
    margin-left: 0;
  }

  .menu-toggle {
    display: flex;
  }

  .collapse-btn {
    display: none;
  }

  .links-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .content-body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
