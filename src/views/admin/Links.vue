<template>
  <div class="link-manage">
    <div class="page-header">
      <h2>链接管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增链接
      </el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterCategory" placeholder="按分类筛选" clearable @change="onFilterCategory" style="width: 180px">
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>
      <el-select v-model="filterSub" placeholder="按子分类筛选" clearable @change="loadList" style="width: 180px; margin-left: 12px">
        <el-option v-for="sub in filteredSubcategories" :key="sub.id" :label="sub.name" :value="sub.id" />
      </el-select>
    </div>

    <el-table :data="list" stripe border style="width: 100%; margin-top: 16px">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" width="180" />
      <el-table-column prop="url" label="链接" min-width="200" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
      <el-table-column prop="subcategory_name" label="子分类" width="120" />
      <el-table-column prop="sort_order" label="排序" width="70" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑链接' : '新增链接'" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="所属子分类">
          <el-select v-model="form.subcategory_id" placeholder="请选择子分类" style="width: 100%">
            <el-option-group v-for="cat in categories" :key="cat.id" :label="cat.name">
              <el-option v-for="sub in cat.subcategories" :key="sub.id" :label="sub.name" :value="sub.id" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="网站名称" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="form.url" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="简短描述" />
        </el-form-item>
        <el-form-item label="图标URL">
          <el-input v-model="form.icon" placeholder="图标图片地址（可选）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories, getSubcategories, getLinks, getAllLinks, createLink, updateLink, deleteLink } from '../../api'

const list = ref([])
const categories = ref([])
const allSubcategories = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const filterCategory = ref(null)
const filterSub = ref(null)
const form = ref({ subcategory_id: null, title: '', url: '', description: '', icon: '', sort_order: 0 })

const filteredSubcategories = computed(() => {
  if (!filterCategory.value) return allSubcategories.value
  return allSubcategories.value.filter(s => s.category_id === filterCategory.value)
})

function openDialog(row) {
  if (row) {
    editingId.value = row.id
    form.value = {
      subcategory_id: row.subcategory_id,
      title: row.title,
      url: row.url,
      description: row.description,
      icon: row.icon || '',
      sort_order: row.sort_order
    }
  } else {
    editingId.value = null
    form.value = { subcategory_id: null, title: '', url: '', description: '', icon: '', sort_order: 0 }
  }
  dialogVisible.value = true
}

function onFilterCategory() {
  filterSub.value = null
  loadList()
}

async function loadList() {
  try {
    const params = {}
    if (filterSub.value) params.subcategoryId = filterSub.value
    const { data } = filterSub.value ? await getLinks(filterSub.value) : await getAllLinks()
    list.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
    list.value = []
    ElMessage.error('加载数据失败')
  }
}

async function loadCategories() {
  const { data } = await getCategories()
  categories.value = data
}

async function loadSubcategories() {
  const { data } = await getSubcategories()
  allSubcategories.value = data
}

async function handleSave() {
  if (!form.value.subcategory_id) return ElMessage.warning('请选择子分类')
  if (!form.value.title) return ElMessage.warning('请输入标题')
  if (!form.value.url) return ElMessage.warning('请输入链接')
  try {
    if (editingId.value) {
      await updateLink(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createLink(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败，请检查网络连接')
  }
}

async function handleDelete(id) {
  await ElMessageBox.confirm('确认删除该链接？', '提示', { type: 'warning' })
  await deleteLink(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(() => { loadList(); loadCategories(); loadSubcategories() })
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header h2 { margin: 0; }
.filter-bar {
  display: flex;
  align-items: center;
}
</style>
