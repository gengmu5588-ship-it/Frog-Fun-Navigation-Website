<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
              <el-icon :size="28"><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.categories }}</div>
              <div class="stat-label">分类数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
              <el-icon :size="28"><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.subcategories }}</div>
              <div class="stat-label">子分类数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
              <el-icon :size="28"><Link /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.links }}</div>
              <div class="stat-label">链接数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategories, getSubcategories, getAllLinks } from '../../api'

const stats = ref({ categories: 0, subcategories: 0, links: 0 })

onMounted(async () => {
  try {
    const [catRes, subRes, linkRes] = await Promise.all([
      getCategories(),
      getSubcategories(),
      getAllLinks()
    ])
    const catData = Array.isArray(catRes.data) ? catRes.data : []
    const subData = Array.isArray(subRes.data) ? subRes.data : []
    const linkData = Array.isArray(linkRes.data) ? linkRes.data : []
    stats.value = {
      categories: catData.length,
      subcategories: subData.length,
      links: linkData.length
    }
  } catch (e) {
    console.error(e)
    stats.value = { categories: 0, subcategories: 0, links: 0 }
  }
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}
</style>
