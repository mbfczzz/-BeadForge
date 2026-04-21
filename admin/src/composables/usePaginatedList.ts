import { ref, onMounted, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import client from '../api/client'
import type { Page } from '../types/models'

/**
 * 统一的"分页列表 + 搜索/筛选 + 删除"抽象，供各管理 views 复用。
 *
 * 用法：
 *   const { list, total, page, pageSize, loading, fetchData, remove } =
 *     usePaginatedList<User>('/admin/users', { pageSize: 20, extraParams: () => ({ keyword: search.value }) })
 *
 * - `extraParams`: 每次请求前动态求值；搜索关键字、分类等放这里
 * - `fetchData()`: 手动触发；`onMounted` 会自动调一次
 * - `remove(id)`: 调用 `${baseUrl}/${id}` 的 DELETE 并刷新
 * - `debounceSearch()`: 搭配输入框使用，自动重置到第 1 页
 */
export function usePaginatedList<T>(
  listUrl: string,
  options: {
    pageSize?: number
    deleteUrl?: (id: number | string) => string
    extraParams?: () => Record<string, any>
    autoFetch?: boolean
  } = {},
) {
  const { pageSize: initialPageSize = 20, deleteUrl, extraParams, autoFetch = true } = options

  const list = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(initialPageSize)
  const loading = ref(false)
  let searchTimer: ReturnType<typeof setTimeout> | null = null

  const fetchData = async () => {
    loading.value = true
    try {
      const params = { page: page.value, size: pageSize.value, ...(extraParams ? extraParams() : {}) }
      // 丢弃 undefined / '' 避免请求体出现无效参数
      Object.keys(params).forEach((k) => {
        const v = (params as any)[k]
        if (v === undefined || v === '' || v === null) delete (params as any)[k]
      })
      const res: any = await client.get(listUrl, { params })
      // 兼容 Page 结构 / 原始数组
      if (Array.isArray(res.data)) {
        list.value = res.data
        total.value = res.data.length
      } else {
        list.value = res.data?.records || []
        total.value = res.data?.total || 0
      }
    } catch (e: any) {
      ElMessage.error(e.message || '加载失败')
    } finally {
      loading.value = false
    }
  }

  const debounceSearch = (delay = 400) => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => { page.value = 1; fetchData() }, delay)
  }

  const remove = async (id: number | string, successMsg = '删除成功') => {
    if (!deleteUrl) throw new Error('未提供 deleteUrl')
    try {
      await client.delete(deleteUrl(id))
      ElMessage.success(successMsg)
      fetchData()
    } catch (e: any) {
      ElMessage.error(e.message || '删除失败')
    }
  }

  const onPageChange = (p: number) => { page.value = p; fetchData() }

  const resetToFirstPage = () => { page.value = 1; fetchData() }

  if (autoFetch) onMounted(fetchData)

  return { list, total, page, pageSize, loading, fetchData, debounceSearch, remove, onPageChange, resetToFirstPage }
}
