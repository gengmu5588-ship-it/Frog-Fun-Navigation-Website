<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">🧭</div>
        <h2>后台管理登录</h2>
        <p>视觉志·导航网</p>
      </div>
      <el-form :model="form" @submit.prevent="handleLogin" class="login-form">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="User"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <a href="/">返回首页</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../../api'

const router = useRouter()
const route = useRoute()
const form = ref({ username: '', password: '' })
const loading = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    return ElMessage.warning('请输入用户名和密码')
  }
  loading.value = true
  try {
    const { data } = await login(form.value)
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_username', data.username)
    ElMessage.success('登录成功')
    router.push(route.query.redirect || '/admin')
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1d1e2c 0%, #2d2e4c 100%);
}

.login-card {
  width: 380px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.login-header h2 {
  margin: 0;
  font-size: 22px;
  color: #1F2329;
}

.login-header p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #8F959E;
}

.login-form {
  margin-top: 8px;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
}

.login-footer a {
  color: #8F959E;
  text-decoration: none;
  font-size: 13px;
}

.login-footer a:hover {
  color: #4F6BED;
}
</style>
