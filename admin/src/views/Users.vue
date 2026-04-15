<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>用户管理 ({{ total }})</span>
        <el-input v-model="search" placeholder="搜索用户名/昵称" prefix-icon="Search" style="width: 240px" clearable @input="debounceSearch" />
      </div>
    </template>
    <el-table :data="users" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机" width="120" />
      <el-table-column prop="createdAt" label="注册时间" width="170" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewUser(row)">查看</el-button>
          <el-popconfirm title="确定删除此用户？" @confirm="deleteUser(row.id)">
            <template #reference>
              <el-button type="danger" link size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > pageSize"
      style="margin-top: 16px; justify-content: center"
      :current-page="page" :page-size="pageSize" :total="total"
      layout="prev, pager, next"
      @current-change="(p: number) => { page = p; fetchData() }"
    />

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
import { ElMessage } from 'element-plus'
import client from '../api/client'

const users = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)
const showDetail = ref(false)
const currentUser = ref<any>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await client.get('/admin/users', { params: { page: page.value, size: pageSize, keyword: search.value || undefined } })
    users.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e: any) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

const debounceSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; fetchData() }, 400)
}

const viewUser = (user: any) => { currentUser.value = user; showDetail.value = true }

const deleteUser = async (id: number) => {
  try {
    await client.delete(`/admin/users/${id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e: any) { ElMessage.error(e.message) }
}

onMounted(fetchData)
</script>
