<template>
  <el-container style="height: 100vh">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" style="transition: width 0.3s">
      <div class="logo" :class="{ collapsed: isCollapse }">
        <span v-if="!isCollapse">🧩 BeadForge</span>
        <span v-else>🧩</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        :collapse="isCollapse"
        background-color="#1a1a2e"
        text-color="#a0a0b0"
        active-text-color="#4b78ff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/designs">
          <el-icon><Picture /></el-icon>
          <template #title>作品管理</template>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><ShoppingBag /></el-icon>
          <template #title>商品管理</template>
        </el-menu-item>
        <el-menu-item index="/patterns">
          <el-icon><Document /></el-icon>
          <template #title>图纸管理</template>
        </el-menu-item>
        <el-menu-item index="/feeds">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>动态管理</template>
        </el-menu-item>
        <el-menu-item index="/api-config">
          <el-icon><Setting /></el-icon>
          <template #title>API 配置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容 -->
    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee">
        <div style="display: flex; align-items: center; gap: 12px">
          <el-icon :size="20" style="cursor: pointer" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb>
            <el-breadcrumb-item>管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-dropdown>
          <span style="cursor: pointer; display: flex; align-items: center; gap: 6px">
            <el-avatar :size="28" style="background: #4b78ff">A</el-avatar>
            管理员
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main style="background: #f5f7fa; overflow-y: auto">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isCollapse = ref(false)
const router = useRouter()

const logout = () => {
  localStorage.removeItem('admin_token')
  router.push('/login')
}
</script>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  background: #1a1a2e;
  letter-spacing: 1px;
}
.logo.collapsed { font-size: 24px; }
.el-aside { background: #1a1a2e; }
.el-menu { border-right: none; }
</style>
