<template>
  <el-card>
    <template #header>
      <span>动态管理 ({{ total }} 条)</span>
    </template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="用户" width="100">
        <template #default="{ row }">{{ row.user?.name || '未知' }}</template>
      </el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column label="标签" width="160">
        <template #default="{ row }">
          <el-tag v-for="t in (row.tags || [])" :key="t" size="small" style="margin-right: 4px">{{ t }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="likeCount" label="点赞" width="70" sortable />
      <el-table-column prop="commentCount" label="评论" width="70" />
      <el-table-column prop="timeAgo" label="时间" width="100" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="danger" link size="small" @click="deleteItem(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import client from '../api/client'

const list = ref<any[]>([])
const loading = ref(false)
const total = ref(0)

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await client.get('/feeds/list', { params: { page: 1, size: 50 } })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e: any) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

const deleteItem = (row: any) => {
  ElMessageBox.confirm(`确定删除该动态？`, '警告', { type: 'warning' })
    .then(() => ElMessage.success('删除成功（需后端admin API）'))
    .catch(() => {})
}

onMounted(fetchData)
</script>
