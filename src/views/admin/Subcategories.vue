<template>
  <div class="subcategory-manage">
    <div class="page-header">
      <h2>子分类管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增子分类
      </el-button>
    </div>

    <el-table :data="list" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="category_name" label="所属分类" width="140" />
      <el-table-column prop="name" label="子分类名称" />
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑子分类' : '新增子分类'" width="460px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="所属分类">
          <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子分类名称">
          <el-input v-model="form.name" placeholder="如：影视在线、壁纸" />
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories, getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '../../api'

const list = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const form = ref({ category_id: null, name: '', sort_order: 0 })

function openDialog(row) {
  if (row) {
    editingId.value = row.id
    form.value = { category_id: row.category_id, name: row.name, sort_order: row.sort_order }
  } else {
    editingId.value = null
    form.value = { category_id: categories.value[0]?.id || null, name: '', sort_order: 0 }
  }
  dialogVisible.value = true
}

async function loadList() {
  try {
    const { data } = await getSubcategories()
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

async function handleSave() {
  if (!form.value.category_id) return ElMessage.warning('请选择所属分类')
  if (!form.value.name) return ElMessage.warning('请输入子分类名称')
  try {
    if (editingId.value) {
      await updateSubcategory(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createSubcategory(form.value)
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
  await ElMessageBox.confirm('删除子分类将同时删除其下所有链接，确认删除？', '警告', { type: 'warning' })
  await deleteSubcategory(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(() => { loadList(); loadCategories() })
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 { margin: 0; }
</style>
