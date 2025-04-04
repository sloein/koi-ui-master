<template>
  <div class="select-filter">
    <div v-for="item in data" :key="item.key" class="select-filter-item">
      <div class="select-filter-item-title">
        <span>{{ item.title }}：</span>
      </div>
      <span v-if="!item.options.length" class="select-filter-notData">暂无数据 ~</span>
      <el-scrollbar>
        <ul class="select-filter-list">
          <li
            v-for="option in item.options"
            :key="option.value"
            :class="{
              active:
                option.value === selected[item.key] ||
                (Array.isArray(selected[item.key]) && selected[item.key].includes(option.value))
            }"
            @click="select(item, option)"
          >
            <slot :row="option">
              <el-icon v-if="option.icon">
                <component :is="option.icon" />
              </el-icon>
              <span>{{ option.label }}</span>
            </slot>
          </li>
        </ul>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts" name="selectFilter">
import { ref, watch } from "vue";

interface IOptionsProps {
  value: string | number;
  label: string;
  icon?: string;
}

interface ISelectDataProps {
  title: string; // 列表标题
  key: string; // 当前筛选项 key 值
  multiple?: boolean; // 是否为多选
  options: IOptionsProps[]; // 筛选数据
}

interface ISelectFilterProps {
  data?: ISelectDataProps[]; // 选择的列表数据
  defaultValues?: { [key: string]: any }; // 默认值
}

const props = withDefaults(defineProps<ISelectFilterProps>(), {
  data: () => [],
  defaultValues: () => ({})
});

// 重新接收默认值
const selected = ref<{ [key: string]: any }>({});

watch(
  () => props.defaultValues,
  () => {
    props.data.forEach(item => {
      if (item.multiple) selected.value[item.key] = props.defaultValues[item.key] ?? [""];
      else selected.value[item.key] = props.defaultValues[item.key] ?? "";
    });
  },
  { deep: true, immediate: true }
);

const emit = defineEmits<{
  change: [value: any];
}>();

/**
 * @description 选择筛选项
 * @param {Object} item 选择的哪项列表
 * @param {Object} option 选择的值
 * @return void
 * */
const select = (item: ISelectDataProps, option: IOptionsProps) => {
  if (!item.multiple) {
    // 单选
    if (selected.value[item.key] !== option.value) selected.value[item.key] = option.value;
  } else {
    // 多选
    // 如果选择的是第一个值，则直接设置
    if (item.options[0].value === option.value) selected.value[item.key] = [option.value];
    // 如果选择的值已经选择了，则删除选择的值
    if (selected.value[item.key].includes(option.value)) {
      let currentIndex = selected.value[item.key].findIndex((s: any) => s === option.value);
      selected.value[item.key].splice(currentIndex, 1);
      // 当全部删光时，把第第一个值选择
      if (selected.value[item.key].length == 0) selected.value[item.key] = [item.options[0].value];
    } else {
      // 未选择点击值的时候，追加选择值
      selected.value[item.key].push(option.value);
      // 单选择全部并且点击到了未选择的值，把第一个值删除掉
      if (selected.value[item.key].includes(item.options[0].value)) selected.value[item.key].splice(0, 1);
    }
  }
  emit("change", selected.value);
};
</script>

<style scoped lang="scss">
.select-filter {
  width: 100%;
  .select-filter-item {
    display: flex;
    align-items: center;
    border-bottom: 1px dashed var(--el-border-color-light);
    &:last-child {
      border-bottom: none;
    }
    .select-filter-item-title {
      margin-top: -2px;
      span {
        font-size: 14px;
        color: var(--el-text-color-regular);
        white-space: nowrap;
      }
    }
    .select-filter-notData {
      margin: 18px 0;
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
    .select-filter-list {
      display: flex;
      flex: 1;
      padding: 0;
      margin: 13px 0;
      li {
        display: flex;
        align-items: center;
        padding: 5px 15px;
        margin-right: 16px;
        font-size: 13px;
        color: var(--el-color-primary);
        list-style: none;
        cursor: pointer;
        background: var(--el-color-primary-light-9);
        border: 1px solid var(--el-color-primary-light-5);
        border-radius: 32px;
        &:hover {
          color: #ffffff;
          background: var(--el-color-primary);
          border-color: var(--el-color-primary);
          transition: 0.1s;
        }
        &.active {
          font-weight: bold;
          color: #ffffff;
          background: var(--el-color-primary);
          border-color: var(--el-color-primary);
        }
        .el-icon {
          margin-right: 4px;
          font-size: 16px;
          font-weight: bold;
        }
        span {
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
