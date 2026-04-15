<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>用户管理</span>
        <el-input v-model="search" placeholder="搜索用户名" prefix-icon="Search" style="width: 240px" clearable @input="fetchUsers" />
      </div>
    </template>
    <el-table :data="users" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机" />
      <el-table-column prop="createdAt" label="注册时间" width="170" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewUser(row)">查看</el-button>
          <el-button type="danger" link size="small" @click="deleteUser(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > pageSize"
      style="margin-top: 16px; justify-content: center"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="(p: number) => { page = p; fetchUsers() }"
    />

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="showDetail" title="用户详情" width="480px">
      <el-descriptions :column="1" border v-if="currentUser">
        <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.createdAt }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import client from '../api/client'

const users = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)
const showDetail = ref(false)
const currentUser = ref<any>(null)

const fetchUsers = async () => {
  loading.value = true
  try {
    // 后端暂无用户列表API，用 mock
    // TODO: 后端新增 GET /admin/users 接口
    users.value = [
      { id: 1, username: 'beadlover', nickname: '拼豆爱好者', email: 'beadlover@test.com', phone: null, createdAt: '2026-04-01' },
      { id: 2, username: 'xiaodouzi', nickname: '小豆子', email: null, phone: null, createdAt: '2026-04-01' },
      { id: 3, username: 'pindoudaren', nickname: '拼豆达人', email: null, phone: null, createdAt: '2026-04-01' },
    ]
    total.value = users.value.length
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

const viewUser = (user: any) => { currentUser.value = user; showDetail.value = true }
const deleteUser = (user: any) => {
  ElMessageBox.confirm(`确定删除用户 ${user.username}？`, '警告', { type: 'warning' })
    .then(() => ElMessage.success('删除成功（mock）'))
    .catch(() => {})
}

onMounted(fetchUsers)
</script>
