<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span>API 密钥配置</span>
        <el-button type="primary" @click="showAdd = true">添加配置</el-button>
      </div>
    </template>

    <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
      API 密钥存储在数据库中，前端代码不包含任何密钥。修改后立即生效。
    </el-alert>

    <el-table :data="configs" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="configKey" label="配置项" width="200" />
      <el-table-column label="值" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="!row._show">{{ maskValue(row.configValue) }}</span>
          <span v-else>{{ row.configValue }}</span>
          <el-button link type="primary" size="small" style="margin-left: 8px" @click="row._show = !row._show">
            {{ row._show ? '隐藏' : '显示' }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" width="200" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="editItem(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="deleteItem(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="showAdd" :title="editingId ? '编辑配置' : '添加配置'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="配置项"><el-input v-model="form.configKey" :disabled="!!editingId" placeholder="如 doubao_api_key" /></el-form-item>
        <el-form-item label="值"><el-input v-model="form.configValue" type="textarea" :rows="3" placeholder="API Key 或配置值" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" placeholder="用途说明" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// TODO: 后端新增 /admin/api-config CRUD 接口
const configs = ref<any[]>([
  { id: 1, configKey: 'doubao_api_key', configValue: 'aa74c59c-9d1d-46b2-a8c1-b1bacb1997cc', description: '豆包文生图 API Key', _show: false },
  { id: 2, configKey: 'doubao_model', configValue: 'doubao-seedream-5-0-260128', description: '豆包文生图模型ID', _show: false },
  { id: 3, configKey: 'doubao_base_url', configValue: 'https://ark.cn-beijing.volces.com/api/v3', description: '豆包API地址', _show: false },
])
const loading = ref(false)
const showAdd = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ configKey: '', configValue: '', description: '' })

const maskValue = (v: string) => v ? v.slice(0, 8) + '****' + v.slice(-4) : ''

const editItem = (row: any) => {
  editingId.value = row.id
  Object.assign(form, { configKey: row.configKey, configValue: row.configValue, description: row.description })
  showAdd.value = true
}

const submitForm = () => {
  if (!form.configKey || !form.configValue) return ElMessage.warning('请填写完整')
  if (editingId.value) {
    const item = configs.value.find(c => c.id === editingId.value)
    if (item) Object.assign(item, { configValue: form.configValue, description: form.description })
  } else {
    configs.value.push({ id: Date.now(), ...form, _show: false })
  }
  ElMessage.success('保存成功')
  showAdd.value = false
  editingId.value = null
}

const deleteItem = (row: any) => {
  ElMessageBox.confirm(`确定删除「${row.configKey}」？`, '警告', { type: 'warning' })
    .then(() => { configs.value = configs.value.filter(c => c.id !== row.id); ElMessage.success('已删除') })
    .catch(() => {})
}
</script>
