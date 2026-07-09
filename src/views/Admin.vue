<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="220px" class="admin-aside">
        <div class="aside-header">
          <h2>后台管理</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#1d1e2c"
          text-color="#a0a4b8"
          active-text-color="#667eea"
        >
          <el-menu-item index="/admin">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <el-icon><Folder /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/subcategories">
            <el-icon><FolderOpened /></el-icon>
            <span>子分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/links">
            <el-icon><Link /></el-icon>
            <span>链接管理</span>
          </el-menu-item>
        </el-menu>
        <div class="aside-footer">
          <a href="/" target="_blank">查看前台</a>
        </div>
      </el-aside>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

:deep(.el-container) {
  height: 100vh;
}

.admin-aside {
  background: #1d1e2c;
  display: flex;
  flex-direction: column;
}

.aside-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.aside-header h2 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.aside-footer {
  margin-top: auto;
  padding: 16px;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.aside-footer a {
  color: #a0a4b8;
  text-decoration: none;
  font-size: 13px;
}

.aside-footer a:hover {
  color: #667eea;
}

.admin-main {
  background: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
  height: 100%;
}

:deep(.el-menu) {
  border-right: none !important;
}

:deep(.el-menu-item) {
  margin: 4px 8px;
  border-radius: 8px;
}

:deep(.el-menu-item.is-active) {
  background: rgba(102,126,234,0.15) !important;
}
</style>
