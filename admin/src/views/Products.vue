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

    <el-dialog v-model="showForm" :title="editingId ? '编辑商品' : '添加商品'" width="720px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
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
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="色值"><el-input v-model="form.color" placeholder="#EF4444" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="图标"><el-input v-model="form.icon" placeholder="box / package / tool" /></el-form-item></el-col>
        </el-row>
        <el-divider content-position="left">详情配置</el-divider>
        <el-form-item label="轮播图">
          <el-input v-model="form.imageUrls" type="textarea" :rows="3" placeholder="每行一个图片 URL" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.specs" type="textarea" :rows="2" placeholder="每行一个规格，例如：2.6mm" />
        </el-form-item>
        <el-form-item label="服务">
          <el-input v-model="form.services" type="textarea" :rows="2" placeholder="每行一个服务，支持 icon|文案，例如：truck|明日发货" />
        </el-form-item>
        <el-form-item label="促销">
          <el-input v-model="form.promotions" type="textarea" :rows="2" placeholder="每行一个促销文案，例如：满 2 件 9.8 折" />
        </el-form-item>
        <el-form-item label="详情">
          <el-input v-model="form.detailSections" type="textarea" :rows="4" placeholder="每行一个详情段落，格式：标题|内容" />
        </el-form-item>
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
const form = reactive({
  name: '',
  description: '',
  category: '珠子',
  price: 0,
  originalPrice: 0,
  tag: '',
  color: '#EF4444',
  icon: 'box',
  specs: '',
  imageUrls: '',
  services: '',
  promotions: '',
  detailSections: '',
})

const toLines = (value: any) => {
  if (!value) return ''
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) return ''
    return parsed
      .map((item) => {
        if (typeof item === 'string') return item
        if (!item || typeof item !== 'object') return ''
        if ('content' in item) return `${item.title || ''}|${item.content || ''}`
        if ('label' in item && 'icon' in item) return `${item.icon || 'check-circle'}|${item.label || ''}`
        if ('label' in item) return item.label || ''
        return ''
      })
      .filter(Boolean)
      .join('\n')
  } catch {
    return String(value)
  }
}

const parseSpecsConfig = (value: any) => {
  if (!value) return { items: [] as string[], imageUrls: [], services: [], promotions: [], detailSections: [] }
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (Array.isArray(parsed)) return { items: parsed, imageUrls: [], services: [], promotions: [], detailSections: [] }
    if (parsed && typeof parsed === 'object') {
      return {
        items: Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed.specs) ? parsed.specs : [],
        imageUrls: Array.isArray(parsed.imageUrls) ? parsed.imageUrls : [],
        services: Array.isArray(parsed.services) ? parsed.services : [],
        promotions: Array.isArray(parsed.promotions) ? parsed.promotions : [],
        detailSections: Array.isArray(parsed.detailSections) ? parsed.detailSections : [],
      }
    }
  } catch {
    return { items: String(value).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean), imageUrls: [], services: [], promotions: [], detailSections: [] }
  }
  return { items: [] as string[], imageUrls: [], services: [], promotions: [], detailSections: [] }
}

const lines = (value: string) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
const servicesArray = (value: string) => lines(value).map((item) => {
  const [icon, ...labelParts] = item.split('|')
  const label = labelParts.join('|').trim()
  return label ? { icon: icon.trim() || 'check-circle', label } : { icon: 'check-circle', label: item }
})
const promotionsArray = (value: string) => lines(value).map((label) => ({ label }))
const sectionsArray = (value: string) => lines(value).map((item) => {
  const [title, ...contentParts] = item.split('|')
  return { title: title.trim() || '商品详情', content: contentParts.join('|').trim() || item }
})
const specsConfigJson = () => JSON.stringify({
  items: lines(form.specs),
  imageUrls: lines(form.imageUrls),
  services: servicesArray(form.services),
  promotions: promotionsArray(form.promotions),
  detailSections: sectionsArray(form.detailSections),
})

const buildPayload = () => ({
  name: form.name,
  description: form.description,
  category: form.category,
  price: form.price,
  originalPrice: form.originalPrice || null,
  tag: form.tag,
  color: form.color || '#EF4444',
  icon: form.icon || 'box',
  specs: specsConfigJson(),
})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await client.get('/products/list', { params: { page: 1, size: 50 } })
    list.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e: any) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

const resetForm = () => Object.assign(form, {
  name: '',
  description: '',
  category: '珠子',
  price: 0,
  originalPrice: 0,
  tag: '',
  color: '#EF4444',
  icon: 'box',
  specs: '',
  imageUrls: '',
  services: 'check-circle|包邮\nshield|7 天退换\ntruck|明日发货',
  promotions: '满 2 件 9.8 折',
  detailSections: '',
})
const openAdd = () => { editingId.value = null; resetForm(); showForm.value = true }
const openEdit = (row: Product) => {
  editingId.value = row.id
  const config = parseSpecsConfig(row.specs)
  Object.assign(form, {
    name: row.name,
    description: row.description || '',
    category: row.category,
    price: Number(row.price),
    originalPrice: Number(row.originalPrice) || 0,
    tag: row.tag || '',
    color: row.color || '#EF4444',
    icon: row.icon || 'box',
    specs: toLines(config.items),
    imageUrls: toLines(config.imageUrls),
    services: toLines(config.services),
    promotions: toLines(config.promotions),
    detailSections: toLines(config.detailSections),
  })
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
    const payload = buildPayload()
    if (editingId.value) {
      await client.put(`/admin/products/${editingId.value}`, payload)
    } else {
      await client.post('/admin/products', payload)
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
