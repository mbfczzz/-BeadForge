<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>图纸管理 ({{ total }})</span>
        <el-select v-model="category" placeholder="分类" clearable style="width: 120px" @change="fetchData">
          <el-option v-for="c in cats" :key="c" :label="c" :value="c" />
        </el-select>
      </div>
    </template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="author" label="作者" width="100" />
      <el-table-column prop="category" label="分类" width="80" />
      <el-table-column label="价格" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.free" type="success" size="small">免费</el-tag>
          <span v-else style="color: #EF4444; font-weight: 700">¥{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="downloads" label="下载" width="80" sortable />
      <el-table-column prop="rating" label="评分" width="70" />
      <el-table-column label="尺寸" width="80">
        <template #default="{ row }">{{ row.cols }}×{{ row.rows }}</template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="确定下架？" @confirm="deleteItem(row.id)">
            <template #reference><el-button type="danger" link size="small">下架</el-button></template>
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

const cats = ['动物', '卡通', '花卉', '美食', '风景', '抽象', '像素']
const list = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const category = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await client.get('/patterns/list', { params: { page: 1, size: 50, category: category.value || undefined } })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e: any) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

const deleteItem = async (id: number) => {
  try { await client.delete(`/admin/patterns/${id}`); ElMessage.success('下架成功'); fetchData() }
  catch (e: any) { ElMessage.error(e.message) }
}

onMounted(fetchData)
</script>
