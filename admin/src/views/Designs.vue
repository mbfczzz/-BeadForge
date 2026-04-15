<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>作品管理 ({{ total }} 件)</span>
        <div style="display: flex; gap: 8px">
          <el-select v-model="category" placeholder="分类" clearable style="width: 120px" @change="fetchData">
            <el-option v-for="c in cats" :key="c" :label="c" :value="c" />
          </el-select>
          <el-input v-model="search" placeholder="搜索标题" prefix-icon="Search" style="width: 200px" clearable @input="fetchData" />
        </div>
      </div>
    </template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="authorName" label="作者" width="100" />
      <el-table-column prop="category" label="分类" width="80" />
      <el-table-column prop="likeCount" label="点赞" width="70" sortable />
      <el-table-column prop="viewCount" label="浏览" width="70" sortable />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : row.status === 'DRAFT' ? 'warning' : 'info'" size="small">
            {{ row.status === 'PUBLISHED' ? '已发布' : row.status === 'DRAFT' ? '草稿' : '已归档' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="danger" link size="small" @click="deleteItem(row)">删除</el-button>
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
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import client from '../api/client'

const cats = ['动物', '卡通', '花卉', '美食', '风景', '抽象', '像素']
const list = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const category = ref('')
const page = ref(1)
const pageSize = 10
const total = ref(0)

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await client.get('/designs/public/list', {
      params: { page: page.value, size: pageSize, category: category.value || undefined },
    })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e: any) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

const deleteItem = (row: any) => {
  ElMessageBox.confirm(`确定删除「${row.title}」？`, '警告', { type: 'warning' })
    .then(() => ElMessage.success('删除成功（需后端admin API）'))
    .catch(() => {})
}

onMounted(fetchData)
</script>
