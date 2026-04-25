<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>字典管理（订单状态文案 / 工单类型 / 钱包流水类型 等）</span>
        <div>
          <el-select v-model="activeType" placeholder="按类型过滤" clearable style="width: 200px; margin-right: 8px"
            @change="fetchData">
            <el-option v-for="t in TYPES" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <el-button type="primary" @click="openAdd">新建字典项</el-button>
          <el-button @click="reload" :loading="reloading">刷新缓存</el-button>
        </div>
      </div>
    </template>

    <el-alert type="info" :closable="false" style="margin-bottom: 16px">
      所有写操作会自动刷新后端内存缓存，无需重启。修改后立刻在前端 App 生效。
    </el-alert>

    <el-table :data="items" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="dictType" label="类型" width="180">
        <template #default="{ row }">
          <el-tag size="small">{{ typeLabel(row.dictType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dictKey" label="Key（英文）" width="180" />
      <el-table-column prop="label" label="中文显示" width="180" />
      <el-table-column prop="description" label="长文案" />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="启用" width="80">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" @change="toggleEnabled(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="deleteItem(row.id)">
            <template #reference><el-button type="danger" link size="small">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showForm" :title="editingId ? '编辑字典项' : '新建字典项'" width="520px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="类型">
          <el-select v-model="form.dictType" :disabled="!!editingId" style="width: 100%">
            <el-option v-for="t in TYPES" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Key">
          <el-input v-model="form.dictKey" :disabled="!!editingId" placeholder="如 PENDING / FEATURE" />
        </el-form-item>
        <el-form-item label="中文显示"><el-input v-model="form.label" /></el-form-item>
        <el-form-item label="长文案">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="可选，长描述（如订单状态说明）" />
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import client from '../api/client'

const TYPES = [
  { value: 'ORDER_STATUS_NOTE', label: '订单状态文案' },
  { value: 'FEEDBACK_TYPE',     label: '工单类型' },
  { value: 'FEEDBACK_STATUS',   label: '工单状态' },
  { value: 'WALLET_LOG_TYPE',   label: '钱包流水类型' },
]

const items = ref<any[]>([])
const loading = ref(false)
const reloading = ref(false)
const activeType = ref('')
const showForm = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ dictType: '', dictKey: '', label: '', description: '', sortOrder: 0, enabled: 1 })

const typeLabel = (v: string) => TYPES.find((t) => t.value === v)?.label || v

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await client.get('/dict', { params: activeType.value ? { type: activeType.value } : {} })
    items.value = res.data || []
  } catch (e: any) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

const reload = async () => {
  reloading.value = true
  try { await client.post('/dict/reload'); ElMessage.success('缓存已刷新') }
  catch (e: any) { ElMessage.error(e.message) }
  finally { reloading.value = false }
}

const openAdd = () => {
  editingId.value = null
  Object.assign(form, { dictType: activeType.value || TYPES[0].value, dictKey: '', label: '', description: '', sortOrder: 99, enabled: 1 })
  showForm.value = true
}

const openEdit = (row: any) => {
  editingId.value = row.id
  Object.assign(form, {
    dictType: row.dictType,
    dictKey: row.dictKey,
    label: row.label || '',
    description: row.description || '',
    sortOrder: row.sortOrder ?? 0,
    enabled: row.enabled ?? 1,
  })
  showForm.value = true
}

const submitForm = async () => {
  if (!form.dictType || !form.dictKey) return ElMessage.warning('类型和 Key 必填')
  submitting.value = true
  try {
    if (editingId.value) await client.put(`/dict/${editingId.value}`, form)
    else                 await client.post('/dict', form)
    ElMessage.success('已保存')
    showForm.value = false
    fetchData()
  } catch (e: any) { ElMessage.error(e.message) }
  finally { submitting.value = false }
}

const toggleEnabled = async (row: any) => {
  try { await client.put(`/dict/${row.id}`, row); ElMessage.success(row.enabled ? '已启用' : '已停用') }
  catch (e: any) { ElMessage.error(e.message); fetchData() }
}

const deleteItem = async (id: number) => {
  try { await client.delete(`/dict/${id}`); ElMessage.success('已删除'); fetchData() }
  catch (e: any) { ElMessage.error(e.message) }
}

onMounted(fetchData)
</script>
