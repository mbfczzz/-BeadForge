<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>作品管理 ({{ total }})</span>
        <el-select v-model="category" placeholder="分类" clearable style="width: 120px" @change="resetToFirstPage">
          <el-option v-for="c in cats" :key="c" :label="c" :value="c" />
        </el-select>
      </div>
    </template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="authorName" label="作者" width="100" />
      <el-table-column prop="category" label="分类" width="80" />
      <el-table-column prop="likeCount" label="点赞" width="70" sortable />
      <el-table-column prop="viewCount" label="浏览" width="70" sortable />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : row.status === 'DRAFT' ? 'warning' : 'info'" size="small">
            {{ row.status === 'PUBLISHED' ? '已发布' : row.status === 'DRAFT' ? '草稿' : '已归档' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="确定删除此作品？" @confirm="remove(row.id)">
            <template #reference>
              <el-button type="danger" link size="small">删除</el-button>
            </template>
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
import { ref } from 'vue'
import { usePaginatedList } from '../composables/usePaginatedList'
import type { Design } from '../types/models'

const cats = ['动物', '卡通', '花卉', '美食', '风景', '抽象', '像素']
const category = ref('')

const { list, total, page, pageSize, loading, remove, onPageChange, resetToFirstPage } =
  usePaginatedList<Design>('/admin/designs', {
    pageSize: 10,
    deleteUrl: (id) => `/admin/designs/${id}`,
    extraParams: () => ({ category: category.value }),
  })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.pager { margin-top: 16px; justify-content: center; }
</style>
