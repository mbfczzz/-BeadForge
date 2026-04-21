<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>商品管理 ({{ total }})</span>
        <el-button type="primary" @click="openAdd">添加商品</el-button>
      </div>
    </template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="80" />
      <el-table-column label="价格" width="120">
        <template #default="{ row }">
          <span class="price">¥{{ row.price }}</span>
          <span v-if="row.originalPrice" class="price-original">¥{{ row.originalPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="80" sortable />
      <el-table-column prop="tag" label="标签" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.tag" :type="row.tag === '爆款' ? 'danger' : 'primary'" size="small">{{ row.tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="remove(row.id)">
            <template #reference><el-button type="danger" link size="small">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="total > pageSize" class="pager"
      :current-page="page" :page-size="pageSize" :total="total" layout="prev, pager, next"
      @current-change="onPageChange" />

    <el-dialog v-model="showForm" :title="editingId ? '编辑商品' : '添加商品'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width: 100%">
            <el-option v-for="c in ['珠子','拼豆板','工具','套装','配件']" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="价格" prop="price"><el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="原价"><el-input-number v-model="form.originalPrice" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="标签"><el-input v-model="form.tag" placeholder="爆款/热销/推荐" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ editingId ? '保存' : '添加' }}</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import client from '../api/client'
import { usePaginatedList } from '../composables/usePaginatedList'
import type { Product } from '../types/models'

const showForm = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ name: '', description: '', category: '珠子', price: 0, originalPrice: 0, tag: '' })
const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

const { list, total, page, pageSize, loading, fetchData, remove, onPageChange } =
  usePaginatedList<Product>('/products/list', {
    pageSize: 20,
    deleteUrl: (id) => `/admin/products/${id}`,
  })

const resetForm = () => Object.assign(form, { name: '', description: '', category: '珠子', price: 0, originalPrice: 0, tag: '' })
const openAdd = () => { editingId.value = null; resetForm(); showForm.value = true }
const openEdit = (row: Product) => {
  editingId.value = row.id
  Object.assign(form, { name: row.name, description: row.description || '', category: row.category || '珠子', price: Number(row.price), originalPrice: Number(row.originalPrice) || 0, tag: row.tag || '' })
  showForm.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await client.put(`/admin/products/${editingId.value}`, form)
    } else {
      await client.post('/admin/products', form)
    }
    ElMessage.success(editingId.value ? '更新成功' : '添加成功')
    showForm.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.pager { margin-top: 16px; justify-content: center; }
.price { color: #ef4444; font-weight: 700; }
.price-original { color: #999; text-decoration: line-through; margin-left: 4px; font-size: 12px; }
</style>
