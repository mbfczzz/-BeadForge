// 后端 Entity / DTO 对应的前端类型，统一替换 `ref<any[]>`。
// 字段与 backend/src/main/java/com/beadforge/model/entity/*.java 保持同步。

export interface User {
  id: number
  username: string
  nickname?: string | null
  avatar?: string | null
  email?: string | null
  phone?: string | null
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface Design {
  id: number
  userId: number
  authorName?: string
  title: string
  description?: string
  category?: string
  designData?: string
  coverImage?: string
  likeCount?: number
  viewCount?: number
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt?: string
  updatedAt?: string
}

export interface PatternListing {
  id: number
  userId?: number
  author?: string
  authorId?: number
  title: string
  description?: string
  category?: string
  price?: number
  free?: boolean
  cols?: number
  rows?: number
  downloads?: number
  rating?: number
  status?: string
  createdAt?: string
}

export interface Feed {
  id: number
  user?: { name: string; title: string }
  content: string
  designId?: number
  tags?: string[]
  likeCount?: number
  commentCount?: number
  shareCount?: number
  timeAgo?: string
  createdAt?: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  sales?: number
  rating?: number
  tag?: string
  color?: string
  icon?: string
  category?: string
  specs?: string
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
}

export interface ApiConfig {
  id: number
  configKey: string
  configValue: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

/** Spring 后端统一的 Page 结构（MyBatis-Plus） */
export interface Page<T> {
  records: T[]
  total: number
  size: number
  current: number
}

/** 后端 ApiResponse 包装 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
