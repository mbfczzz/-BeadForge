<template>
  <div>
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6" v-for="stat in statCards" :key="stat.label">
        <el-card shadow="hover">
          <div style="display: flex; align-items: center; gap: 16px">
            <div :style="{ background: stat.color + '15', color: stat.color, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div>
              <div style="font-size: 28px; font-weight: 800; color: #333">{{ stat.value }}</div>
              <div style="font-size: 13px; color: #999">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>最近作品</template>
          <el-table :data="designs" size="small" stripe>
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="authorName" label="作者" width="100" />
            <el-table-column prop="category" label="分类" width="80" />
            <el-table-column prop="likeCount" label="点赞" width="70" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'warning'" size="small">
                  {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>最近动态</template>
          <el-table :data="feeds" size="small" stripe>
            <el-table-column label="用户" width="100">
              <template #default="{ row }">{{ row.user?.name || '未知' }}</template>
            </el-table-column>
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column prop="likeCount" label="点赞" width="70" />
            <el-table-column prop="timeAgo" label="时间" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '../api/client'

const statCards = ref([
  { label: '用户总数', value: 0, icon: 'User', color: '#4b78ff' },
  { label: '作品总数', value: 0, icon: 'Picture', color: '#22C55E' },
  { label: '商品总数', value: 0, icon: 'ShoppingBag', color: '#F97316' },
  { label: '动态总数', value: 0, icon: 'ChatDotRound', color: '#EC4899' },
])
const designs = ref<any[]>([])
const feeds = ref<any[]>([])

onMounted(async () => {
  // 分开请求，互不影响：stats 需要认证，列表是公开接口
  try {
    const statsRes: any = await client.get('/admin/stats')
    const s = statsRes.data
    statCards.value[0].value = s.users || 0
    statCards.value[1].value = s.designs || 0
    statCards.value[2].value = s.products || 0
    statCards.value[3].value = s.feeds || 0
  } catch {
    // token 过期会跳登录页，这里不处理
  }

  try {
    const dRes: any = await client.get('/designs/public/list', { params: { page: 1, size: 5 } })
    designs.value = dRes.data?.records || []
  } catch {}

  try {
    const fRes: any = await client.get('/feeds/list', { params: { page: 1, size: 5 } })
    feeds.value = fRes.data?.records || []
  } catch {}
})
</script>
