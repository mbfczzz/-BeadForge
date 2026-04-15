<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>API 密钥配置</span>
        <el-button type="primary" @click="openAdd">添加配置</el-button>
      </div>
    </template>

    <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
      API 密钥存储在数据库中，前端代码不包含任何密钥。修改后立即生效。
    </el-alert>

    <el-table :data="configs" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="configKey" label="配置项" width="200" />
      <el-table-column label="值">
        <template #default="{ row }">
          <span v-if="!row._show">{{ maskValue(row.configValue) }}</span>
          <span v-else style="word-break: break-all">{{ row.configValue }}</span>
          <el-button link type="primary" size="small" style="margin-left: 8px" @click="row._show = !row._show">
            {{ row._show ? '隐藏' : '显示' }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" width="200" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="deleteItem(row.id)">
            <template #reference><el-button type="danger" link size="small">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showForm" :title="editingId ? '编辑配置' : '添加配置'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="配置项"><el-input v-model="form.configKey" :disabled="!!editingId" placeholder="如 doubao_api_key" /></el-form-item>
        <el-form-item label="值"><el-input v-model="form.configValue" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" /></el-form-item>
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

const configs = ref<any[]>([])
const loading = ref(false)
const showForm = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ configKey: '', configValue: '', description: '' })

const maskValue = (v: string) => v ? v.slice(0, 8) + '****' + v.slice(-4) : ''

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await client.get('/admin/api-config')
    configs.value = (res.data || []).map((c: any) => ({ ...c, _show: false }))
  } catch (e: any) { ElMessage.error(e.message) }
  finally { loading.value = false }
}

const openAdd = () => { editingId.value = null; Object.assign(form, { configKey: '', configValue: '', description: '' }); showForm.value = true }
const openEdit = (row: any) => {
  editingId.value = row.id
  Object.assign(form, { configKey: row.configKey, configValue: row.configValue, description: row.description || '' })
  showForm.value = true
}

const submitForm = async () => {
  if (!form.configKey || !form.configValue) return ElMessage.warning('请填写完整')
  submitting.value = true
  try {
    if (editingId.value) {
      await client.put(`/admin/api-config/${editingId.value}`, form)
    } else {
      await client.post('/admin/api-config', form)
    }
    ElMessage.success('保存成功')
    showForm.value = false; fetchData()
  } catch (e: any) { ElMessage.error(e.message) }
  finally { submitting.value = false }
}

const deleteItem = async (id: number) => {
  try { await client.delete(`/admin/api-config/${id}`); ElMessage.success('已删除'); fetchData() }
  catch (e: any) { ElMessage.error(e.message) }
}

onMounted(fetchData)
</script>
