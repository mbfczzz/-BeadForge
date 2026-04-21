<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>用户管理 ({{ total }})</span>
        <el-input v-model="search" placeholder="搜索用户名/昵称" prefix-icon="Search" style="width: 240px" clearable @input="debounceSearch" />
      </div>
    </template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机" width="120" />
      <el-table-column prop="createdAt" label="注册时间" width="170" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewUser(row)">查看</el-button>
          <el-popconfirm title="确定删除此用户？" @confirm="remove(row.id)">
            <template #reference>
              <el-button type="danger" link size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > pageSize"
      class="pager"
      :current-page="page" :page-size="pageSize" :total="total"
      layout="prev, pager, next"
      @current-change="onPageChange"
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
import { ref } from 'vue'
import { usePaginatedList } from '../composables/usePaginatedList'
import type { User } from '../types/models'

const search = ref('')
const showDetail = ref(false)
const currentUser = ref<User | null>(null)

const { list, total, page, pageSize, loading, debounceSearch, remove, onPageChange } =
  usePaginatedList<User>('/admin/users', {
    pageSize: 20,
    deleteUrl: (id) => `/admin/users/${id}`,
    extraParams: () => ({ keyword: search.value }),
  })

const viewUser = (user: User) => { currentUser.value = user; showDetail.value = true }
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.pager { margin-top: 16px; justify-content: center; }
</style>
