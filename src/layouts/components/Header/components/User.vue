<template>
  <!-- 头像 -->
  <el-image class="w-34px h-34px rounded-full select-none user-avatar" :src="loginUser?.avatar || errorAvatar">
    <template #error>
      <el-image class="w-34px h-34px rounded-full select-none user-avatar" :src="errorAvatar"></el-image>
    </template>
  </el-image>
  <el-dropdown 
    class="m-l-10px" 
    trigger="click"
    :hide-timeout="50"
    placement="bottom-end"
    @command="handleCommand"
  >
    <div class="koi-dropdown">
      <div class="max-w-113px text-14px m-r-6px line-clamp-1 select-none">{{ loginUser?.nickName }}</div>
      <el-icon><arrow-down /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="koiMine">{{ $t("header.personalCenter") }}</el-dropdown-item>
        <el-dropdown-item command="logout">{{ $t("header.logout") }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import {  computed } from "vue";
import { koiSessionStorage, koiLocalStorage } from "@/utils/storage.ts";
import { LOGIN_URL } from "@/config";
import { useRouter } from "vue-router";
import useAuthStore from "@/stores/modules/auth";
import useUserStore from "@/stores/modules/user";
const router = useRouter();
const authStore = useAuthStore();

const userStore = useUserStore();
// 获取用户信息
const loginUser = computed(() => userStore.loginUser);
console.log("用户信息", userStore.loginUser);
// 获取角色名称
const roleName = computed(() => {
  if (authStore.roleList && authStore.roleList.length > 0) {
    return authStore.roleList[0].roleName || '管理员';
  }
  return '管理员';
});

// 退出登录
const handleLayout = () => {
  koiSessionStorage.clear();
  // 如果不想要保存上次登录设置的全局颜色、布局等，则将下方第一行清空全部代码打开。
  // koiLocalStorage.clear();
  koiLocalStorage.remove("user");
  koiLocalStorage.remove("keepAlive");
  koiLocalStorage.remove("tabs");
  // 退出登录。必须使用replace把页面缓存刷掉。
  window.location.replace(LOGIN_URL);
};

const errorAvatar = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";

// 下拉折叠
const handleCommand = (command: string | number) => {
  switch (command) {
    case "koiMine":
      router.push("/system/personage");
      break;
    case "logout":
      handleLayout();
      break;
  }
};
</script>

<style lang="scss" scoped>
// dropdown字体颜色
.koi-dropdown {
  color: var(--el-color-primary);
  white-space: nowrap; /* 不换行 */
  cursor: pointer;
  outline: none; // 去除伪元素
  display: flex;
  align-items: center;
}
</style>
