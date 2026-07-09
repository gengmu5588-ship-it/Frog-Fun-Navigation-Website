<template>
  <div class="nav-home">
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
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="nav-group"
        >
          <!-- 分类项 -->
          <div
            class="nav-category"
            :class="{ active: activeCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name" v-show="!sidebarCollapsed || isMobile">{{ cat.name }}</span>
            <span
              v-if="cat.subcategories?.length && (!sidebarCollapsed || isMobile)"
              class="expand-arrow"
              :class="{ expanded: activeCategory === cat.id }"
            >›</span>
          </div>

          <!-- 子分类列表 -->
          <transition name="slide">
            <div
              v-if="activeCategory === cat.id && cat.subcategories?.length && (!sidebarCollapsed || isMobile)"
              class="nav-subcategories"
            >
              <div
                v-for="sub in cat.subcategories"
                :key="sub.id"
                class="nav-sub"
                :class="{ active: activeSubcategory === sub.id }"
                @click.stop="activeSubcategory = sub.id"
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
          <span v-if="currentSubcategoryName" class="sep">/</span>
          <span v-if="currentSubcategoryName" class="current-sub">{{ currentSubcategoryName }}</span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          «
        </button>
      </header>

      <!-- 子分类标签栏 -->
      <div class="sub-tabs-bar" v-if="currentSubcategories.length > 1">
        <div
          v-for="sub in currentSubcategories"
          :key="sub.id"
          class="sub-tab"
          :class="{ active: activeSubcategory === sub.id }"
          @click="activeSubcategory = sub.id"
        >
          {{ sub.name }}
        </div>
      </div>

      <!-- 链接卡片网格 -->
      <main class="content-body">
        <div class="links-grid" v-if="currentLinks.length">
          <a
            v-for="link in currentLinks"
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
        <div v-else class="empty-state">暂无链接</div>
      </main>

      <!-- 底部 -->
      <footer class="main-footer">
        <p>© 2024 {{ siteConfig.title }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getNavData } from '../api'

const siteConfig = ref({ title: '视觉志·导航网' })
const categories = ref([])
const activeCategory = ref(null)
const activeSubcategory = ref(null)
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const isMobile = ref(false)

const currentSubcategories = computed(() => {
  const cat = categories.value.find(c => c.id === activeCategory.value)
  return cat ? cat.subcategories : []
})

const currentLinks = computed(() => {
  const sub = currentSubcategories.value.find(s => s.id === activeSubcategory.value)
  return sub ? sub.links : []
})

const currentCategoryName = computed(() => {
  const cat = categories.value.find(c => c.id === activeCategory.value)
  return cat ? cat.name : ''
})

const currentSubcategoryName = computed(() => {
  const sub = currentSubcategories.value.find(s => s.id === activeSubcategory.value)
  return sub ? sub.name : ''
})

function selectCategory(id) {
  activeCategory.value = id
  const subs = categories.value.find(c => c.id === id)?.subcategories || []
  activeSubcategory.value = subs.length ? subs[0].id : null
  if (isMobile.value) {
    mobileMenuOpen.value = false
  }
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
  try {
    const { data } = await getNavData()
    siteConfig.value = data.config || { title: '视觉志·导航网' }
    categories.value = data.categories || []
    if (categories.value.length) {
      selectCategory(categories.value[0].id)
    }
  } catch (e) {
    console.error('加载数据失败', e)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.nav-home {
  min-height: 100vh;
  background: #F5F6F8;
}

/* ========== 侧边栏 ========== */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: #FAFBFC;
  border-right: 1px solid #E8ECF0;
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  border-bottom: 1px solid #E8ECF0;
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
  color: #1F2329;
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
  background: #D0D3D6;
  border-radius: 2px;
}

.nav-group {
  margin-bottom: 2px;
}

.nav-category {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  color: #646A73;
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
  background: #F0F1F3;
  color: #1F2329;
}

.nav-category.active {
  background: #F0F2FF;
  color: #4F6BED;
}

.nav-category.active::before {
  background: #4F6BED;
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

.expand-arrow {
  font-size: 16px;
  transition: transform 0.2s;
  color: #8F959E;
}

.expand-arrow.expanded {
  transform: rotate(90deg);
}

/* 子分类 */
.nav-subcategories {
  overflow: hidden;
}

.nav-sub {
  padding: 7px 20px 7px 54px;
  font-size: 13px;
  color: #8F959E;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-sub:hover {
  color: #4F6BED;
  background: #F8F9FA;
}

.nav-sub.active {
  color: #4F6BED;
  background: #EEF0FF;
  font-weight: 500;
}

/* 子分类展开/折叠动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  max-height: 500px;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* 侧边栏底部 */
.sidebar-footer {
  border-top: 1px solid #E8ECF0;
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
  color: #8F959E;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.admin-link:hover {
  color: #4F6BED;
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
  background: #FFFFFF;
  border-bottom: 1px solid #E8ECF0;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
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
  background: #1F2329;
  border-radius: 1px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.current-cat {
  color: #1F2329;
  font-weight: 500;
}

.sep {
  color: #D0D3D6;
}

.current-sub {
  color: #646A73;
}

.collapse-btn {
  margin-left: auto;
  background: none;
  border: 1px solid #E8ECF0;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  color: #8F959E;
  font-size: 14px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  border-color: #4F6BED;
  color: #4F6BED;
}

/* 子分类标签栏 */
.sub-tabs-bar {
  display: flex;
  gap: 6px;
  padding: 16px 24px 0;
  flex-wrap: wrap;
}

.sub-tab {
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 13px;
  color: #646A73;
  cursor: pointer;
  transition: all 0.2s;
  background: #FFFFFF;
  border: 1px solid #E8ECF0;
}

.sub-tab:hover {
  border-color: #4F6BED;
  color: #4F6BED;
}

.sub-tab.active {
  background: #4F6BED;
  color: #FFFFFF;
  border-color: #4F6BED;
}

/* 内容区 */
.content-body {
  flex: 1;
  padding: 20px 24px;
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
  background: #FFFFFF;
  border-radius: 10px;
  text-decoration: none;
  color: #1F2329;
  transition: all 0.2s;
  border: 1px solid #E8ECF0;
}

.link-card:hover {
  border-color: #4F6BED;
  box-shadow: 0 2px 12px rgba(79, 107, 237, 0.1);
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
  background: #F0F2FF;
}

.link-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-icon {
  color: #4F6BED;
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
  color: #8F959E;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8F959E;
  font-size: 14px;
}

/* 底部 */
.main-footer {
  padding: 16px 24px;
  text-align: center;
  color: #8F959E;
  font-size: 12px;
  border-top: 1px solid #E8ECF0;
}

/* ========== 移动端遮罩 ========== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
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
