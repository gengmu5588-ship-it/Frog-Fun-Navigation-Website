<template>
  <div class="admin-layout">
    <el-container direction="vertical">
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
          <div class="admin-user" v-if="username">
            <span>{{ username }}</span>
          </div>
          <div class="aside-actions">
            <a href="/" target="_blank">查看前台</a>
            <a href="javascript:;" @click="handleLogout">退出登录</a>
          </div>
        </div>
      </el-aside>
      <el-main class="admin-main">
        <router-view />
      </el-main>
      </el-container>
      <el-footer height="44" class="admin-footer">
        Copyright © 2026 视觉志导航. 浙ICP备2026038793号-1. Design by TRAE ide
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)
const username = computed(() => localStorage.getItem('admin_username') || '')

function handleLogout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_username')
  ElMessage.success('已退出登录')
  router.push('/admin/login')
}
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
  border-top: 1px solid rgba(255,255,255,0.05);
}

.admin-user {
  text-align: center;
  color: #a0a4b8;
  font-size: 13px;
  margin-bottom: 8px;
}

.aside-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.aside-actions a {
  color: #a0a4b8;
  text-decoration: none;
  font-size: 13px;
}

.aside-actions a:hover {
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

.admin-footer {
  background: #fff;
  color: #8F959E;
  font-size: 12px;
  text-align: center;
  line-height: 44px;
  border-top: 1px solid #E8ECF0;
}
</style>
