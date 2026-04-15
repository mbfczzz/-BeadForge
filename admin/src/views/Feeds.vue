<template>
  <el-card>
    <template #header>动态管理 ({{ total }})</template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="用户" width="100">
        <template #default="{ row }">{{ row.user?.name || '未知' }}</template>
      </el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column label="标签" width="160">
        <template #default="{ row }">
          <el-tag v-for="t in (row.tags || [])" :key="t" size="small" style="margin: 0 2px">{{ t }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="likeCount" label="点赞" width="70" sortable />
      <el-table-column prop="commentCount" label="评论" width="70" />
      <el-table-column prop="timeAgo" label="时间" width="100" />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="确定删除此动态？" @confirm="deleteItem(row.id)">
            <template #reference><el-button type="danger" link size="small">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
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

const deleteItem = async (id: number) => {
  try { await client.delete(`/admin/feeds/${id}`); ElMessage.success('删除成功'); fetchData() }
  catch (e: any) { ElMessage.error(e.message) }
}

onMounted(fetchData)
</script>
