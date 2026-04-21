<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>图纸管理 ({{ total }})</span>
        <el-select v-model="category" placeholder="分类" clearable style="width: 120px" @change="resetToFirstPage">
          <el-option v-for="c in cats" :key="c" :label="c" :value="c" />
        </el-select>
      </div>
    </template>
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="author" label="作者" width="100" />
      <el-table-column prop="category" label="分类" width="80" />
      <el-table-column label="价格" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.free" type="success" size="small">免费</el-tag>
          <span v-else class="price">¥{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="downloads" label="下载" width="80" sortable />
      <el-table-column prop="rating" label="评分" width="70" />
      <el-table-column label="尺寸" width="80">
        <template #default="{ row }">{{ row.cols }}×{{ row.rows }}</template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="确定下架？" @confirm="remove(row.id, '下架成功')">
            <template #reference><el-button type="danger" link size="small">下架</el-button></template>
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
import type { PatternListing } from '../types/models'

const cats = ['动物', '卡通', '花卉', '美食', '风景', '抽象', '像素']
const category = ref('')

const { list, total, page, pageSize, loading, remove, onPageChange, resetToFirstPage } =
  usePaginatedList<PatternListing>('/patterns/list', {
    pageSize: 20,
    deleteUrl: (id) => `/admin/patterns/${id}`,
    extraParams: () => ({ category: category.value }),
  })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.pager { margin-top: 16px; justify-content: center; }
.price { color: #ef4444; font-weight: 700; }
</style>
