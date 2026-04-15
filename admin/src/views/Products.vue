<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>商品管理 ({{ total }} 件)</span>
        <el-button type="primary" @click="showAdd = true">添加商品</el-button>
      </div>
    </template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="80" />
      <el-table-column label="价格" width="100">
        <template #default="{ row }">
          <span style="color: #EF4444; font-weight: 700">¥{{ row.price }}</span>
          <span v-if="row.originalPrice" style="color: #999; text-decoration: line-through; margin-left: 4px; font-size: 12px">¥{{ row.originalPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="80" sortable />
      <el-table-column prop="rating" label="评分" width="70" />
      <el-table-column prop="tag" label="标签" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.tag" :type="row.tag === '爆款' ? 'danger' : row.tag === '热销' ? 'warning' : 'primary'" size="small">
            {{ row.tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="editItem(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="deleteItem(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="showAdd" :title="editingId ? '编辑商品' : '添加商品'" width="520px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" style="width: 100%">
            <el-option v-for="c in ['珠子','拼豆板','工具','套装','配件']" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="原价"><el-input-number v-model="form.originalPrice" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="标签"><el-input v-model="form.tag" placeholder="爆款/热销/推荐/必买" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="submitForm">{{ editingId ? '保存' : '添加' }}</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import client from '../api/client'

const list = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const showAdd = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ name: '', description: '', category: '珠子', price: 0, originalPrice: 0, tag: '' })

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await client.get('/products/list', { params: { page: 1, size: 50 } })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e: any) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

const editItem = (row: any) => {
  editingId.value = row.id
  Object.assign(form, { name: row.name, description: row.description, category: row.category, price: row.price, originalPrice: row.originalPrice || 0, tag: row.tag || '' })
  showAdd.value = true
}

const submitForm = () => {
  ElMessage.success(editingId.value ? '编辑成功（需后端admin API）' : '添加成功（需后端admin API）')
  showAdd.value = false
  editingId.value = null
}

const deleteItem = (row: any) => {
  ElMessageBox.confirm(`确定删除「${row.name}」？`, '警告', { type: 'warning' })
    .then(() => ElMessage.success('删除成功（需后端admin API）'))
    .catch(() => {})
}

onMounted(fetchData)
</script>
