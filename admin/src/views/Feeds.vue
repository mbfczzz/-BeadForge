<template>
  <el-card>
    <template #header>动态管理 ({{ total }})</template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="用户" width="100">
        <template #default="{ row }">{{ row.user?.name || '未知' }}</template>
      </el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column label="标签" width="160">
        <template #default="{ row }">
          <el-tag v-for="t in (row.tags || [])" :key="t" size="small" class="tag">{{ t }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="likeCount" label="点赞" width="70" sortable />
      <el-table-column prop="commentCount" label="评论" width="70" />
      <el-table-column prop="timeAgo" label="时间" width="100" />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="确定删除此动态？" @confirm="remove(row.id)">
            <template #reference><el-button type="danger" link size="small">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="total > pageSize" class="pager"
      :current-page="page" :page-size="pageSize" :total="total" layout="prev, pager, next"
      @current-change="onPageChange" />
  </el-card>
</template>

<script setup lang="ts">
import { usePaginatedList } from '../composables/usePaginatedList'
import type { Feed } from '../types/models'

const { list, total, page, pageSize, loading, remove, onPageChange } =
  usePaginatedList<Feed>('/feeds/list', {
    pageSize: 20,
    deleteUrl: (id) => `/admin/feeds/${id}`,
  })
</script>

<style scoped>
.pager { margin-top: 16px; justify-content: center; }
.tag { margin: 0 2px; }
</style>
