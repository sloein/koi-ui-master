<template>
  <div class="koi-flex">
    <KoiCard>
      <!-- 搜索条件 -->
      <el-form v-show="showSearch" :inline="true">
        <el-form-item label="课程名称" prop="title">
          <el-input
            placeholder="请输入课程名称"
            v-model="searchParams.title"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleListPage"
          ></el-input>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input
            placeholder="请输入课程描述"
            v-model="searchParams.description"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleListPage"
          ></el-input>
        </el-form-item>
    
        <el-form-item>
          <el-button type="primary" icon="search" plain v-throttle="handleSearch">搜索</el-button>
          <el-button type="danger" icon="refresh" plain v-debounce="resetSearch">重置</el-button>
          <el-button type="primary" icon="plus" plain @click="handleAdd()">新增</el-button>
     
        </el-form-item>
      </el-form>
      <!-- 表格头部按钮 -->
      <!-- <el-row :gutter="10">
        <el-col :span="1.5" >
          <el-button type="primary" icon="plus" plain @click="handleAdd()">新增</el-button>
        </el-col>
    
        <el-col :span="1.5" >
          <el-button type="danger" icon="delete" plain @click="handleBatchDelete()" :disabled="multiple">删除</el-button>
        </el-col>
    
        <KoiToolbar v-model:showSearch="showSearch" @refreshTable="handleListPage"></KoiToolbar>
      </el-row> -->

      <div class="h-20px"></div>
      <!-- 数据表格 -->
       
      <el-table
        v-loading="loading"
        border
        :data="tableList"
        empty-text="暂时没有数据哟🌻"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" prop="id" width="80" align="center" type="index"></el-table-column>
        <el-table-column
          label="课程名称"
          prop="title"
          min-width="200"
          :show-overflow-tooltip="true"
          align="center"
        ></el-table-column>
        <el-table-column
          label="课程描述"
          prop="description"
          min-width="400"
          :show-overflow-tooltip="true"
          align="center"
        ></el-table-column>
        <el-table-column label="封面图" width="120" align="center">
          <template #default="scope">
            <el-image 
              :src="scope.row.coverImage" 
              :preview-src-list="[scope.row.coverImage]"
              fit="cover"
              style="width: 80px; height: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column label="课程状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
         <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情🌻" placement="top">
              <el-button
                type="primary"
                icon="View"
                circle
                plain
                @click="handleDetail(row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="修改🌻" placement="top">
              <el-button
                type="warning"
                icon="Edit"
                circle
                plain
                :disabled="!isCourseTeacher(row.teachers)&&!isAdmin"
                @click="handleUpdate(row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除🌻" placement="top">
              <el-button
                type="danger"
                icon="Delete"
                circle
                plain
                :disabled="!isCourseTeacher(row.teachers)&&!isAdmin"
                @click="handleDelete(row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="h-20px"></div>
      <!-- 分页 -->
      <el-pagination
        background
        v-model:current-page="searchParams.pageNo"
        v-model:page-size="searchParams.pageSize"
        v-show="total > 0"
        :page-sizes="[10, 20, 50, 100, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleListPage"
        @current-change="handleListPage"
      />

      <!-- 添加 OR 修改 -->
      <KoiDialog
        ref="koiDialogRef"
        :title="title"
        @koiConfirm="handleConfirm"
        @koiCancel="handleCancel"
        :loading="confirmLoading"
      >
        <template #content>
          <el-form ref="formRef" :rules="rules" :model="form" label-width="80px" status-icon>
            <el-row>
              <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                <el-form-item label="课程名称" prop="title">
                  <el-input v-model="form.title" placeholder="请输入课程名称" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                <el-form-item label="课程描述" prop="description">
                  <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入课程描述" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :sm="{ span: 12 }" :xs="{ span: 24 }">
                <el-form-item label="开始时间" prop="startTime">
                  <el-date-picker
                    v-model="form.startTime"
                    type="datetime"
                    placeholder="选择开始时间"
                    style="width: 260px"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
              <el-col :sm="{ span: 12 }" :xs="{ span: 24 }" class="p-l-10px">
                <el-form-item label="结束时间" prop="endTime">
                  <el-date-picker
                    v-model="form.endTime"
                    type="datetime"
                    placeholder="选择结束时间"
                    style="width: 260px"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                <el-form-item label="封面图" prop="coverImage">
                  <KoiUploadImage v-model:imageUrl="form.coverImage">
                    <template #content>
                      <div class="flex flex-col items-center justify-center h-full">
                        <el-icon><Plus /></el-icon>
                        <span class="mt-2">点击上传封面</span>
                      </div>
                    </template>
                  </KoiUploadImage>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                <el-form-item label="课程状态" prop="status">
                  <el-select v-model="form.status" placeholder="请选择课程状态" style="width: 260px" clearable>
                    <el-option label="未开始" value="not_started" />
                    <el-option label="进行中" value="in_progress" />
                    <el-option label="已结束" value="finished" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </KoiDialog>
    </KoiCard>
  </div>
</template>

<script setup lang="ts" name="coursePage">
import { nextTick, ref, reactive, onMounted, computed } from "vue";
import { Plus } from '@element-plus/icons-vue'
import { koiNoticeSuccess, koiNoticeError, koiMsgError, koiMsgWarning, koiMsgBox, koiMsgInfo } from "@/utils/koi.ts";
import { listPage, getById, add, update, deleteById, batchDelete } from "@/api/system/course/index.ts";
import KoiUploadImage from "@/components/KoiUpload/Image.vue";
import { useRouter } from "vue-router";
import useUserStore from "@/stores/modules/user";
// 表格加载动画Loading
const loading = ref(false);
// 是否显示搜索表单[默认显示]
const showSearch = ref<boolean>(true);
// 表格数据
const tableList = ref<any>([]);
const userStore = useUserStore();

// 查询参数
const searchParams = ref({
  pageNo: 1,
  pageSize: 10,
  userId: "",
  title: "",
  description: "",
  startTime: "",
  endTime: ""
});

const total = ref<number>(0);

/** 重置搜索参数 */
const resetSearchParams = () => {
  searchParams.value = {
    pageNo: 1,
    pageSize: 10,
    userId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: ""
  };
};

/** 搜索 */
const handleSearch = () => {
  searchParams.value.pageNo = 1;
  handleListPage();
};

/** 重置 */
const resetSearch = () => {
  resetSearchParams();
  handleListPage();
};

/** 数据表格 */
const handleListPage = async () => {
  loading.value = true;
  try {
    tableList.value = [];
    const res: any = await listPage(searchParams.value);
    // 确保res.data存在，如果不存在则使用默认值
    if (res.data) {
      tableList.value = res.data.courses || [];
      total.value = res.data.totalCount || 0;
    } else {
      tableList.value = [];
      total.value = 0;
    }
    console.log("tableList", tableList.value);
  } catch (error) {
    console.log(error);
    koiNoticeError("数据查询失败，请刷新重试🌻");
    tableList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;  // 确保在任何情况下都关闭loading
  }
};

/** 数据表格[删除、批量删除等刷新使用] */
const handleTableData = async () => {
  try {
    const res: any = await listPage(searchParams.value);
    tableList.value = res.data.courses;
    total.value = res.data.totalCount;
  } catch (error) {
    console.log(error);
    koiNoticeError("数据查询失败，请刷新重试🌻");
  }
};

onMounted(() => {
  handleListPage();
  console.log("userStore.loginUser", userStore.loginUser);
});


const isAdmin = computed(() => {
  return userStore.loginUser.isAdmin;
});

const ids = ref([]);
const single = ref<boolean>(true);
const multiple = ref<boolean>(true);

/** 是否多选 */
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 添加 */
const handleAdd = () => {
  koiDialogRef.value.koiOpen();
  koiNoticeSuccess("添加🌻");
  resetForm();
  title.value = "课程添加";
  form.value.status = "not_started";
};

/** 回显数据 */
const handleEcho = async (id: any) => {
  if (id == null || id == "") {
    koiMsgWarning("请选择需要修改的数据🌻");
    return;
  }
  try {
    const res: any = await getById(id);
    form.value = res.data;
  } catch (error) {
    console.log(error);
    koiNoticeError("数据获取失败，请刷新重试🌻");
  }
};

/** 修改 */
const handleUpdate = async (row?: any) => {
  koiDialogRef.value.koiOpen();
  koiNoticeSuccess("修改🌻");
  resetForm();
  title.value = "课程修改";
  const id = row ? row.id : ids.value[0];
  if (id == null || id == "") {
    koiMsgError("请选择需要修改的数据🌻");
  }
  handleEcho(id);
};

// 添加 OR 修改对话框Ref 
const koiDialogRef = ref();
// 标题
const title = ref("课程管理");
// form表单Ref
const formRef = ref<any>();

// form表单
let form = ref<any>({
  id: "",
  title: "",
  description: "",
  coverImage: "",
  status: "",
  
});

/** 清空表单数据 */
const resetForm = () => {
  nextTick(() => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
  });     
  form.value = {
    id: "",
    title: "",
    description: "",
    coverImage: "",
    status: "",
  
  };
};

/** 表单规则 */
const rules = reactive({
  title: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入课程描述", trigger: "blur" }],
  status: [{ required: true, message: "请选择课程状态", trigger: "blur" }],
});

// 确定按钮是否显示Loading
const confirmLoading = ref(false);

/** 确定  */
const handleConfirm = () => {
  if (!formRef.value) return;
  confirmLoading.value = true;
  (formRef.value as any).validate(async (valid: any) => {
    if (valid) {
      if (form.value.id != null && form.value.id != "") {
        try {
          await update(form.value);
          koiNoticeSuccess("修改成功🌻");
          confirmLoading.value = false;
          koiDialogRef.value.koiQuickClose();
          resetForm();
          handleListPage();
        } catch (error) {
          console.log(error);
          confirmLoading.value = false;
          koiNoticeError("修改失败，请刷新重试🌻");
        }
      } else {
        try {
          await add(form.value);
          koiNoticeSuccess("添加成功🌻");
          confirmLoading.value = false;
          koiDialogRef.value.koiQuickClose();
          resetForm();
          handleListPage();
        } catch (error) {
          console.log(error);
          confirmLoading.value = false;
          koiNoticeError("添加失败，请刷新重试🌻");
        }
      }
    } else {
      koiMsgError("验证失败，请检查填写内容🌻");
      confirmLoading.value = false;
    }
  });
};

/** 取消 */
const handleCancel = () => {
  koiDialogRef.value.koiClose();
};

/** 删除 */
const handleDelete = (row: any) => {
  const id = row.id;
  if (id == null || id == "") {
    koiMsgWarning("请选择需要删除的数据🌻");
    return;
  }
  koiMsgBox("您确认需要删除课程[" + row.title + "]么？")
    .then(async () => {
      try {
        await deleteById(id);
        handleTableData();
        koiNoticeSuccess("删除成功🌻");
      } catch (error) {
        console.log(error);
        koiNoticeError("删除失败，请刷新重试🌻");
        handleTableData();
      }
    })
    .catch(() => {
      koiMsgError("已取消🌻");
    });
};

const router = useRouter();

/** 查看详情 */
const handleDetail = async (row: any) => {
  router.push(`/course/detail/${row.id}`);
};

/** 批量删除 */
const handleBatchDelete = () => {
  if (ids.value.length == 0) {
    koiMsgInfo("请选择需要删除的数据🌻");
    return;
  }
  koiMsgBox("您确认需要进行批量删除么？")
    .then(async () => {
      try {
        await batchDelete(ids.value);
        handleTableData();
        koiNoticeSuccess("批量删除成功🌻");
      } catch (error) {
        console.log(error);
        koiNoticeError("批量删除失败，请刷新重试🌻");
        handleTableData();
      }
    })
    .catch(() => {
      koiMsgError("已取消🌻");
    });
};

/** 获取状态标签类型 */
const getStatusType = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'not_started': 'info',
    'in_progress': 'success',
    'finished': 'warning'
  };
  return statusMap[status] || 'info';
};

/** 获取状态显示文本 */
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'finished': '已结束'
  };
  return statusMap[status] || '未知状态';
};

/** 判断当前用户是否为课程教师 */
const isCourseTeacher = (teachers: any[]) => {
  if (!teachers || teachers.length === 0) return false;
  return teachers.some(teacher => teacher.id === userStore.loginUser.id);
};
</script>

<style lang="scss" scoped>
.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
</style>
