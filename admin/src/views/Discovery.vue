<template>
  <el-tabs v-model="active">
    <!-- ────────── Banner ────────── -->
    <el-tab-pane label="首页 Banner" name="banner">
      <el-card>
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span>首页轮播 Banner</span>
            <el-button type="primary" @click="openBannerForm()">新建 Banner</el-button>
          </div>
        </template>
        <el-table :data="banners" v-loading="loadingB" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="sortOrder" label="排序" width="70" />
          <el-table-column prop="title" label="标题" width="160" />
          <el-table-column prop="sub" label="副标题" />
          <el-table-column label="背景色" width="100">
            <template #default="{ row }">
              <div style="display:flex;align-items:center;gap:6px">
                <span :style="{ background: row.bg, width: '18px', height: '18px', borderRadius: '4px', display: 'inline-block', border: '1px solid #ddd' }" />
                <span style="font-size:12px">{{ row.bg }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="cat" label="分类" width="80" />
          <el-table-column prop="sortMode" label="排序模式" width="90" />
          <el-table-column prop="buttonText" label="按钮文案" width="100" />
          <el-table-column label="启用" width="70">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" @change="updateBanner(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openBannerForm(row)">编辑</el-button>
              <el-popconfirm title="确定删除？" @confirm="deleteBanner(row.id)">
                <template #reference><el-button link type="danger" size="small">删除</el-button></template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-dialog v-model="showBanner" :title="editingBId ? '编辑 Banner' : '新建 Banner'" width="520px">
          <el-form :model="bannerForm" label-width="90px">
            <el-form-item label="标题"><el-input v-model="bannerForm.title" /></el-form-item>
            <el-form-item label="副标题"><el-input v-model="bannerForm.sub" /></el-form-item>
            <el-form-item label="图案下标"><el-input-number v-model="bannerForm.pi" :min="0" :max="20" /></el-form-item>
            <el-form-item label="背景色"><el-input v-model="bannerForm.bg" placeholder="如 #4B78FF" /></el-form-item>
            <el-form-item label="关联分类"><el-input v-model="bannerForm.cat" placeholder="如 动物 / 花草" clearable /></el-form-item>
            <el-form-item label="排序模式">
              <el-select v-model="bannerForm.sortMode" style="width: 100%">
                <el-option value="hot" label="按热度" />
                <el-option value="latest" label="按最新" />
              </el-select>
            </el-form-item>
            <el-form-item label="排序"><el-input-number v-model="bannerForm.sortOrder" :min="0" /></el-form-item>
            <el-form-item label="上方小字"><el-input v-model="bannerForm.eyebrow" /></el-form-item>
            <el-form-item label="按钮文案"><el-input v-model="bannerForm.buttonText" /></el-form-item>
            <el-form-item label="文字色"><el-input v-model="bannerForm.textColor" placeholder="可选 hex" clearable /></el-form-item>
            <el-form-item label="启用">
              <el-switch v-model="bannerForm.enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showBanner = false">取消</el-button>
            <el-button type="primary" :loading="submittingB" @click="submitBanner">保存</el-button>
          </template>
        </el-dialog>
      </el-card>
    </el-tab-pane>

    <!-- ────────── Tab ────────── -->
    <el-tab-pane label="过滤 Tab" name="tab">
      <el-card>
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span>发现页过滤 Tab</span>
            <el-button type="primary" @click="openTabForm()">新建 Tab</el-button>
          </div>
        </template>
        <el-table :data="tabs" v-loading="loadingT" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="sortOrder" label="排序" width="70" />
          <el-table-column prop="tabKey" label="Key" width="100" />
          <el-table-column prop="label" label="显示名" width="100" />
          <el-table-column prop="bannerIds" label="关联 Banner" width="120" />
          <el-table-column prop="categories" label="关联分类" width="120" />
          <el-table-column prop="sortMode" label="排序模式" width="90" />
          <el-table-column prop="resultTitle" label="结果标题" width="120" />
          <el-table-column label="默认" width="60">
            <template #default="{ row }">
              <el-tag v-if="row.isDefault" size="small" type="success">默认</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="启用" width="70">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" @change="updateTab(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openTabForm(row)">编辑</el-button>
              <el-popconfirm title="确定删除？" @confirm="deleteTab(row.id)">
                <template #reference><el-button link type="danger" size="small">删除</el-button></template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-dialog v-model="showTab" :title="editingTId ? '编辑 Tab' : '新建 Tab'" width="520px">
          <el-form :model="tabForm" label-width="100px">
            <el-form-item label="Key"><el-input v-model="tabForm.tabKey" :disabled="!!editingTId" placeholder="如 all / animal" /></el-form-item>
            <el-form-item label="显示名"><el-input v-model="tabForm.label" /></el-form-item>
            <el-form-item label="关联 Banner"><el-input v-model="tabForm.bannerIds" placeholder="逗号分隔，如 1,2,3" /></el-form-item>
            <el-form-item label="关联分类"><el-input v-model="tabForm.categories" placeholder="逗号分隔，如 动物,花草" /></el-form-item>
            <el-form-item label="访问模式"><el-input v-model="tabForm.accessModes" placeholder="逗号分隔 free,points,member" /></el-form-item>
            <el-form-item label="排序模式">
              <el-select v-model="tabForm.sortMode" style="width: 100%">
                <el-option value="hot" label="按热度" />
                <el-option value="latest" label="按最新" />
              </el-select>
            </el-form-item>
            <el-form-item label="排序"><el-input-number v-model="tabForm.sortOrder" :min="0" /></el-form-item>
            <el-form-item label="结果标题"><el-input v-model="tabForm.resultTitle" /></el-form-item>
            <el-form-item label="空状态文案"><el-input v-model="tabForm.emptyText" /></el-form-item>
            <el-form-item label="搜索占位"><el-input v-model="tabForm.searchPlaceholder" placeholder="可选" clearable /></el-form-item>
            <el-form-item label="设为默认">
              <el-switch v-model="tabForm.isDefault" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="启用">
              <el-switch v-model="tabForm.enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showTab = false">取消</el-button>
            <el-button type="primary" :loading="submittingT" @click="submitTab">保存</el-button>
          </template>
        </el-dialog>
      </el-card>
    </el-tab-pane>

    <!-- ────────── 全局文案 ────────── -->
    <el-tab-pane label="全局文案" name="setting">
      <el-card>
        <template #header><span>全局文案配置（搜索框 / 默认推荐标题 / 空状态）</span></template>
        <el-table :data="settings" v-loading="loadingS" stripe>
          <el-table-column prop="configKey" label="Key" width="220" />
          <el-table-column label="值">
            <template #default="{ row }">
              <el-input v-model="row.configValue" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="saveSetting(row)">保存</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import client from '../api/client'

const active = ref('banner')

/* ────────── Banner ────────── */
const banners = ref<any[]>([])
const loadingB = ref(false)
const showBanner = ref(false)
const submittingB = ref(false)
const editingBId = ref<number | null>(null)
const bannerForm = reactive<any>({ title: '', sub: '', pi: 0, bg: '#4B78FF', cat: '', sortMode: 'hot', sortOrder: 99, eyebrow: '', buttonText: '', textColor: '', enabled: 1 })

const fetchBanners = async () => {
  loadingB.value = true
  try { const res: any = await client.get('/discovery/banners'); banners.value = res.data || [] }
  catch (e: any) { ElMessage.error(e.message) }
  finally { loadingB.value = false }
}

const openBannerForm = (row?: any) => {
  if (row) {
    editingBId.value = row.id
    Object.assign(bannerForm, { ...row })
  } else {
    editingBId.value = null
    Object.assign(bannerForm, { title: '', sub: '', pi: 0, bg: '#4B78FF', cat: '', sortMode: 'hot', sortOrder: 99, eyebrow: '', buttonText: '', textColor: '', enabled: 1 })
  }
  showBanner.value = true
}

const submitBanner = async () => {
  if (!bannerForm.title) return ElMessage.warning('标题必填')
  submittingB.value = true
  try {
    if (editingBId.value) await client.put(`/discovery/banners/${editingBId.value}`, bannerForm)
    else                  await client.post('/discovery/banners', bannerForm)
    ElMessage.success('已保存')
    showBanner.value = false
    fetchBanners()
  } catch (e: any) { ElMessage.error(e.message) }
  finally { submittingB.value = false }
}

const updateBanner = async (row: any) => {
  try { await client.put(`/discovery/banners/${row.id}`, row) }
  catch (e: any) { ElMessage.error(e.message); fetchBanners() }
}

const deleteBanner = async (id: number) => {
  try { await client.delete(`/discovery/banners/${id}`); ElMessage.success('已删除'); fetchBanners() }
  catch (e: any) { ElMessage.error(e.message) }
}

/* ────────── Tab ────────── */
const tabs = ref<any[]>([])
const loadingT = ref(false)
const showTab = ref(false)
const submittingT = ref(false)
const editingTId = ref<number | null>(null)
const tabForm = reactive<any>({ tabKey: '', label: '', bannerIds: '', categories: '', accessModes: '', sortMode: 'hot', sortOrder: 99, resultTitle: '', emptyText: '', searchPlaceholder: '', isDefault: 0, enabled: 1 })

const fetchTabs = async () => {
  loadingT.value = true
  try { const res: any = await client.get('/discovery/tabs'); tabs.value = res.data || [] }
  catch (e: any) { ElMessage.error(e.message) }
  finally { loadingT.value = false }
}

const openTabForm = (row?: any) => {
  if (row) {
    editingTId.value = row.id
    Object.assign(tabForm, { ...row })
  } else {
    editingTId.value = null
    Object.assign(tabForm, { tabKey: '', label: '', bannerIds: '', categories: '', accessModes: '', sortMode: 'hot', sortOrder: 99, resultTitle: '', emptyText: '', searchPlaceholder: '', isDefault: 0, enabled: 1 })
  }
  showTab.value = true
}

const submitTab = async () => {
  if (!tabForm.tabKey || !tabForm.label) return ElMessage.warning('Key 和显示名必填')
  submittingT.value = true
  try {
    if (editingTId.value) await client.put(`/discovery/tabs/${editingTId.value}`, tabForm)
    else                  await client.post('/discovery/tabs', tabForm)
    ElMessage.success('已保存')
    showTab.value = false
    fetchTabs()
  } catch (e: any) { ElMessage.error(e.message) }
  finally { submittingT.value = false }
}

const updateTab = async (row: any) => {
  try { await client.put(`/discovery/tabs/${row.id}`, row) }
  catch (e: any) { ElMessage.error(e.message); fetchTabs() }
}

const deleteTab = async (id: number) => {
  try { await client.delete(`/discovery/tabs/${id}`); ElMessage.success('已删除'); fetchTabs() }
  catch (e: any) { ElMessage.error(e.message) }
}

/* ────────── Settings ────────── */
const settings = ref<any[]>([])
const loadingS = ref(false)

const fetchSettings = async () => {
  loadingS.value = true
  try { const res: any = await client.get('/discovery/settings'); settings.value = res.data || [] }
  catch (e: any) { ElMessage.error(e.message) }
  finally { loadingS.value = false }
}

const saveSetting = async (row: any) => {
  try { await client.put(`/discovery/settings/${row.configKey}`, { value: row.configValue }); ElMessage.success('已保存') }
  catch (e: any) { ElMessage.error(e.message) }
}

watch(active, (v) => {
  if (v === 'banner') fetchBanners()
  if (v === 'tab') fetchTabs()
  if (v === 'setting') fetchSettings()
})

onMounted(fetchBanners)
</script>
