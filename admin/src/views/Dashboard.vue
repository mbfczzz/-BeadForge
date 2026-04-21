<template>
  <div>
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6" v-for="stat in statCards" :key="stat.label">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" :style="{ background: stat.color + '15', color: stat.color }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card v-loading="loadingDesigns">
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
        <el-card v-loading="loadingFeeds">
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
import type { Design, Feed } from '../types/models'

const statCards = ref([
  { label: '用户总数', value: 0, icon: 'User', color: '#4b78ff' },
  { label: '作品总数', value: 0, icon: 'Picture', color: '#22C55E' },
  { label: '商品总数', value: 0, icon: 'ShoppingBag', color: '#F97316' },
  { label: '动态总数', value: 0, icon: 'ChatDotRound', color: '#EC4899' },
])
const designs = ref<Design[]>([])
const feeds = ref<Feed[]>([])
const loadingDesigns = ref(false)
const loadingFeeds = ref(false)

onMounted(async () => {
  loadingDesigns.value = true
  loadingFeeds.value = true
  // 三个接口互不依赖；用 allSettled 并发，任一失败都不阻塞其他卡片
  const [statsR, dR, fR] = await Promise.allSettled([
    client.get('/admin/stats'),
    client.get('/designs/public/list', { params: { page: 1, size: 5 } }),
    client.get('/feeds/list', { params: { page: 1, size: 5 } }),
  ])

  if (statsR.status === 'fulfilled') {
    const s = (statsR.value as any).data || {}
    statCards.value[0].value = s.users || 0
    statCards.value[1].value = s.designs || 0
    statCards.value[2].value = s.products || 0
    statCards.value[3].value = s.feeds || 0
  }
  if (dR.status === 'fulfilled') designs.value = (dR.value as any).data?.records || []
  if (fR.status === 'fulfilled') feeds.value = (fR.value as any).data?.records || []

  loadingDesigns.value = false
  loadingFeeds.value = false
})
</script>

<style scoped>
.stat-row { margin-bottom: 20px; }
.stat-card { display: flex; align-items: center; gap: 16px; }
.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
}
.stat-value { font-size: 28px; font-weight: 800; color: #333; }
.stat-label { font-size: 13px; color: #999; }
</style>
