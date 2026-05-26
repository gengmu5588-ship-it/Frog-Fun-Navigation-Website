<template>
  <div class="category-manage">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增分类
      </el-button>
    </div>

    <el-table :data="list" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="{ row }">
          <span style="font-size: 22px">{{ row.icon }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑分类' : '新增分类'" width="460px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="如：常用、影视" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="如：🔥、🎬（Emoji）" />
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
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api'

const list = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const form = ref({ name: '', icon: '', sort_order: 0 })

function openDialog(row) {
  if (row) {
    editingId.value = row.id
    form.value = { name: row.name, icon: row.icon, sort_order: row.sort_order }
  } else {
    editingId.value = null
    form.value = { name: '', icon: '', sort_order: 0 }
  }
  dialogVisible.value = true
}

async function loadList() {
  const { data } = await getCategories()
  list.value = data
}

async function handleSave() {
  if (!form.value.name) return ElMessage.warning('请输入分类名称')
  if (editingId.value) {
    await updateCategory(editingId.value, form.value)
    ElMessage.success('更新成功')
  } else {
    await createCategory(form.value)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadList()
}

async function handleDelete(id) {
  await ElMessageBox.confirm('删除分类将同时删除其下所有子分类和链接，确认删除？', '警告', { type: 'warning' })
  await deleteCategory(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
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
