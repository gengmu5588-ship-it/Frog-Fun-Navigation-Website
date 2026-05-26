<template>
  <div class="nav-home">
    <!-- 顶部栏 -->
    <header class="nav-header">
      <div class="header-inner">
        <div class="logo-area">
          <div class="logo-icon">🧭</div>
          <h1 class="site-title">{{ siteConfig.title }}</h1>
        </div>
        <div class="header-right">
          <a href="/admin" class="admin-link" target="_blank">后台管理</a>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="nav-main">
      <div class="nav-container">
        <!-- 分类标签 -->
        <div class="category-tabs">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-tab"
            :class="{ active: activeCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </div>
        </div>

        <!-- 子分类标签 -->
        <div class="subcategory-tabs" v-if="currentSubcategories.length">
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

        <!-- 链接卡片 -->
        <div class="links-grid">
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
      </div>
    </main>

    <!-- 底部 -->
    <footer class="nav-footer">
      <p>© 2024 {{ siteConfig.title }} - 聚合导航</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getNavData } from '../api'

const siteConfig = ref({ title: '聚合导航' })
const categories = ref([])
const activeCategory = ref(null)
const activeSubcategory = ref(null)

const currentSubcategories = computed(() => {
  const cat = categories.value.find(c => c.id === activeCategory.value)
  return cat ? cat.subcategories : []
})

const currentLinks = computed(() => {
  const sub = currentSubcategories.value.find(s => s.id === activeSubcategory.value)
  return sub ? sub.links : []
})

function selectCategory(id) {
  activeCategory.value = id
  const subs = categories.value.find(c => c.id === id)?.subcategories || []
  activeSubcategory.value = subs.length ? subs[0].id : null
}

function handleIconError(e) {
  e.target.style.display = 'none'
}

onMounted(async () => {
  try {
    const { data } = await getNavData()
    siteConfig.value = data.config || { title: '聚合导航' }
    categories.value = data.categories || []
    if (categories.value.length) {
      selectCategory(categories.value[0].id)
    }
  } catch (e) {
    console.error('加载数据失败', e)
  }
})
</script>

<style scoped>
/* 全局样式 */
.nav-home {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.nav-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  height: 36px;
  width: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(255,255,255,0.2);
}

.site-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
}

.admin-link {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 14px;
  padding: 6px 16px;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 20px;
  transition: all 0.3s;
}

.admin-link:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

/* 主内容 */
.nav-main {
  flex: 1;
  padding: 20px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #fff;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  color: #333;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  user-select: none;
}

.category-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(102,126,234,0.4);
}

.cat-icon {
  font-size: 18px;
}

/* 子分类标签 */
.subcategory-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.sub-tab {
  padding: 6px 16px;
  background: #fff;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.3s;
  border: 1px solid #e8e8e8;
}

.sub-tab:hover {
  color: #667eea;
  border-color: #667eea;
}

.sub-tab.active {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}

/* 链接卡片网格 */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  border: 1px solid transparent;
}

.link-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.link-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.link-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-icon {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-desc {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 底部 */
.nav-footer {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-header {
    padding: 0 12px;
  }
  .header-inner {
    height: 50px;
  }
  .site-title {
    font-size: 16px;
  }
  .nav-main {
    padding: 12px;
  }
  .category-tab {
    padding: 8px 14px;
    font-size: 13px;
  }
  .links-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  .link-card {
    padding: 12px;
  }
}
</style>
