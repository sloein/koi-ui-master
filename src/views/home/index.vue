<template>
  <div class="overflow-x-hidden">
    <el-card class="rounded-md" shadow="hover">
      <div class="flex flex-items-center" v-waterMarker="{ text: 'SS-ADMIN', textColor: '#D9D9D9' }">
        <img class="w-60px h-60px rounded-full select-none user-avatar" :src="avatar" alt="avatar" />
        <div class="p-l-20px">
          <div class="font-bold p-b-8px whitespace-nowrap">
            <span>{{ userStore.loginUser?.nickName }}🌻</span>
          </div>
          <div class="font-bold whitespace-nowrap">君可愿白衣饮茶，清风瘦马，再听一曲六月雨下。🌻</div>
        </div>
      </div>
    </el-card>
    
    <el-row :gutter="20" class="m-t-5px">
      <KoiCard></KoiCard>
      <el-col :span="24" class="m-t-5px">
        <el-card class="rounded-md" shadow="hover">
          <template #header>
            🦀日交易趋势
          </template>
          <KoiTradeChart></KoiTradeChart>
        </el-card>
      </el-col>
      <el-col :span="12" :lg="12" :md="12" :sm="24" :xs="24" class="m-t-5px">
        <el-card class="rounded-md" shadow="hover">
          <template #header>
            🐻地区异常订单排行
          </template>
          <KoiLeftChart></KoiLeftChart>
        </el-card>
      </el-col>
      <el-col :span="12" :lg="12" :md="12" :sm="24" :xs="24" class="m-t-5px">
        <el-card class="rounded-md" shadow="hover">
          <template #header>
            🐻‍❄️近10日订单量
          </template>
          <KoiRightChart></KoiRightChart>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="m-t-5px">
      <el-col :span="12" :lg="12" :md="12" :sm="24" :xs="24">
        <el-card class="rounded-md" shadow="hover">
          <KoiTimeline1></KoiTimeline1>
        </el-card>
      </el-col>
      <el-col :span="12" :lg="12" :md="12" :sm="24" :xs="24">
        <el-card class="rounded-md" shadow="hover">
          <KoiTimeline2></KoiTimeline2>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="homePage">
import { getDayText } from "@/utils/random.ts";
import { koiNoticeSuccess } from "@/utils/koi.ts";
import KoiCard from "./components/KoiCard.vue";
import KoiTradeChart from "./components/KoiTradeChart.vue";
import KoiLeftChart from "./components/KoiLeftChart.vue";
import KoiRightChart from "./components/KoiRightChart.vue";
import KoiTimeline1 from "./components/KoiTimeline1.vue";
import KoiTimeline2 from "./components/KoiTimeline2.vue";
import { onMounted, computed } from "vue";
import useUserStore from "@/stores/modules/user";

const userStore = useUserStore();

onMounted(() => {
  // 时间问候语
  koiNoticeSuccess(getDayText(), "欢迎回来~");
});


// 头像
const avatar = computed(() => userStore.loginUser?.avatar);

</script>

<style lang="scss" scoped></style>
