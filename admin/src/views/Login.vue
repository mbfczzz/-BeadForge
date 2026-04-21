<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="logo">🧩</span>
        <h1>BeadForge 管理后台</h1>
      </div>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.username" prefix-icon="User" placeholder="用户名" size="large" :disabled="locked" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" prefix-icon="Lock" placeholder="密码" type="password" size="large" show-password :disabled="locked" />
        </el-form-item>
        <el-alert v-if="locked" type="warning" :closable="false" show-icon class="lock-tip">
          失败次数过多，请 {{ lockCountdown }} 秒后再试
        </el-alert>
        <el-button type="primary" size="large" class="submit-btn" :loading="loading" :disabled="locked" native-type="submit">
          登 录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import client from '../api/client'

const router = useRouter()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

// 轻量级本地防暴破：连续失败 5 次即前端锁定 60 秒（仅提升体验；真正防御依赖后端）
const MAX_ATTEMPTS = 5
const LOCK_SECONDS = 60
const failCount = ref(0)
const locked = ref(false)
const lockCountdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const startLock = () => {
  locked.value = true
  lockCountdown.value = LOCK_SECONDS
  timer = setInterval(() => {
    lockCountdown.value -= 1
    if (lockCountdown.value <= 0) {
      locked.value = false
      failCount.value = 0
      if (timer) { clearInterval(timer); timer = null }
    }
  }, 1000)
}

onUnmounted(() => { if (timer) clearInterval(timer) })

const handleLogin = async () => {
  if (locked.value) return
  if (!form.username || !form.password) return ElMessage.warning('请输入用户名和密码')
  loading.value = true
  try {
    const res: any = await client.post('/auth/login', form)
    localStorage.setItem('admin_token', res.data.token)
    failCount.value = 0
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (e: any) {
    failCount.value += 1
    const remaining = MAX_ATTEMPTS - failCount.value
    if (remaining <= 0) {
      startLock()
      ElMessage.error(`失败次数过多，已临时锁定 ${LOCK_SECONDS} 秒`)
    } else {
      ElMessage.error(`${e.message || '登录失败'}（还剩 ${remaining} 次尝试）`)
    }
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-header .logo { font-size: 48px; }
.login-header h1 { font-size: 20px; color: #333; margin-top: 12px; }
.submit-btn { width: 100%; }
.lock-tip { margin-bottom: 12px; }
</style>
