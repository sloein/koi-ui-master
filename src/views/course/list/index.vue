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
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="searchParams.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 240px"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="searchParams.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 240px"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" plain v-throttle="handleSearch">搜索</el-button>
          <el-button type="danger" icon="refresh" plain v-debounce="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 表格头部按钮 -->
      <el-row :gutter="10">
        <el-col :span="1.5" >
          <el-button type="primary" icon="plus" plain @click="handleAdd()">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="success" icon="edit" plain @click="handleUpdate()" :disabled="single">修改</el-button>
        </el-col>
        <el-col :span="1.5" >
          <el-button type="danger" icon="delete" plain @click="handleBatchDelete()" :disabled="multiple">删除</el-button>
        </el-col>
        <el-col :span="1.5" >
          <el-button type="warning" icon="download" plain>导出</el-button>
        </el-col>
        <el-col :span="1.5" >
          <el-button type="info" icon="upload" plain>导入</el-button>
        </el-col>
        <KoiToolbar v-model:showSearch="showSearch" @refreshTable="handleListPage"></KoiToolbar>
      </el-row>

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
        <el-table-column label="序号" prop="id" width="120px" align="center" type="index"></el-table-column>
        <el-table-column
          label="课程名称"
          prop="title"
          width="180px"
          :show-overflow-tooltip="true"
          align="center"
        ></el-table-column>
        <el-table-column
          label="课程描述"
          prop="description"
          width="260px"
          :show-overflow-tooltip="true"
          align="center"
        ></el-table-column>
        <el-table-column label="封面图" width="120px" align="center">
          <template #default="scope">
            <el-image 
              :src="scope.row.coverImage" 
              :preview-src-list="[scope.row.coverImage]"
              fit="cover"
              style="width: 80px; height: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column label="课程状态" prop="status" width="100px" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ scope.row.status === 'ACTIVE' ? '进行中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="startTime" width="180px" align="center"></el-table-column>
        <el-table-column label="结束时间" prop="endTime" width="180px" align="center"></el-table-column>
        <el-table-column label="创建时间" prop="createdAt" width="180px" align="center"></el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="修改🌻" placement="top">
              <el-button
                type="primary"
                icon="Edit"
                circle
                plain
                @click="handleUpdate(row)"
                v-auth="['course:update']"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除🌻" placement="top">
              <el-button
                type="danger"
                icon="Delete"
                circle
                plain
                @click="handleDelete(row)"
                v-auth="['course:delete']"
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
                  <el-upload
                    class="avatar-uploader"
                    action="/api/upload"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload"
                  >
                    <img v-if="form.coverImage" :src="form.coverImage" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                <el-form-item label="课程状态" prop="status">
                  <el-select v-model="form.status" placeholder="请选择课程状态" style="width: 260px" clearable>
                    <el-option label="进行中" value="ACTIVE" />
                    <el-option label="已结束" value="ENDED" />
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
import { nextTick, ref, reactive, onMounted } from "vue";
import { Plus } from '@element-plus/icons-vue'
import { koiNoticeSuccess, koiNoticeError, koiMsgError, koiMsgWarning, koiMsgBox, koiMsgInfo } from "@/utils/koi.ts";
import { listPage, getById, add, update, deleteById, batchDelete } from "@/api/system/course/index.ts";

// 表格加载动画Loading
const loading = ref(false);
// 是否显示搜索表单[默认显示]
const showSearch = ref<boolean>(true);
// 表格数据
const tableList = ref<any>([]);

// 查询参数
const searchParams = ref({
  pageNo: 1,
  pageSize: 10,
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
  try {
    loading.value = true;
    tableList.value = [];
    const res: any = await listPage(searchParams.value);
    tableList.value = res.data.courses;
    total.value = res.data.totalCount;
    loading.value = false;
  } catch (error) {
    console.log(error);
    koiNoticeError("数据查询失败，请刷新重试🌻");
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
  form.value.status = "ACTIVE";
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
  startTime: "",
  endTime: ""
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
    startTime: "",
    endTime: ""
  };
};

/** 表单规则 */
const rules = reactive({
  title: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入课程描述", trigger: "blur" }],
  status: [{ required: true, message: "请选择课程状态", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "blur" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "blur" }]
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

/** 上传图片相关方法 */
const handleAvatarSuccess = (response: any) => {
  form.value.coverImage = response.url;
};

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    koiMsgError('上传头像图片只能是 JPG/PNG/GIF 格式!');
  }
  if (!isLt2M) {
    koiMsgError('上传头像图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
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
