<template>
  <div class="course-detail">
    <!-- 基本信息卡片 -->
    <KoiCard class="mb-4">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">课程基本信息</span>
        </div>
      </template>
      <div class="card-content">
        <div class="flex">
          <!-- 左侧封面图 -->
          <div class="cover-image mr-6">
            <el-image :src="courseData.coverImage" fit="cover"
              style="width: 200px; height: 200px; border-radius: 8px;" />
          </div>
          <!-- 右侧信息 -->
          <div class="flex-1">
            <div class="mb-4">
              <h2 class="text-2xl font-bold mb-2">{{ courseData.title }}</h2>
              <el-tag :type="getStatusType(courseData.status)" class="ml-2">
                {{ getStatusText(courseData.status) }}
              </el-tag>
            </div>
            <p class="text-gray-600 mb-4">{{ courseData.description }}</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-500">开始时间</p>
                <p value-format="YYYY-MM-DD HH:mm:ss">{{ courseData.startTime }}</p>
              </div>
              <div>
                <p class="text-gray-500">结束时间</p>
                <p value-format="YYYY-MM-DD HH:mm:ss">{{ courseData.endTime }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 教师和学生信息 -->
        <div class="mt-6">
          <div class="mb-4">
            <h3 class="text-lg font-bold mb-2">授课教师</h3>
            <div class="flex flex-wrap gap-2">
              <el-tag v-for="teacher in courseData.teachers" :key="teacher.id" type="success">
                {{ teacher.nickName }}
              </el-tag>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-2">课程学生</h3>
            <div class="flex flex-wrap gap-2">
              <el-tag v-for="student in courseData.students" :key="student.id" type="info">
                {{ student.nickName }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 课程资料 -->
        <div class="mt-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">课程资料</h3>
            <el-button type="primary" icon="Upload" @click="handleUploadMaterial">
              上传资料
            </el-button>
          </div>
          <div class="materials-list">
            <el-table :data="courseData.materials" border style="width: 100%">
              <el-table-column prop="title" label="资料名称" />
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column label="操作" width="180" align="center">
                <template #default="scope">
                  <el-tooltip content="下载资料🌻" placement="top">
                    <el-button type="primary" link @click="handleDownloadMaterial(scope.row)">
                      下载
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="删除资料🌻" placement="top">
                    <el-button type="danger" link :disabled="!isCourseTeacher(courseData.teachers) && !isAdmin"
                      @click="handleDeleteMaterial(scope.row)">
                      删除
                    </el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </KoiCard>

    <!-- 章节内容卡片 -->
    <KoiCard class="mb-4">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">课程章节</span>
          <el-switch v-model="isSort" active-text="开启排序" inactive-text="关闭排序" :disabled="!isCourseTeacher(courseData.teachers) && !isAdmin"  @change="() => {
            enableRowDrop(
              handleChapterSort,
              courseData.chapters,
              isSort,
              chapterTableId
            );
          }" />
        </div>
      </template>
      <el-table :id="chapterTableId" :data="courseData.chapters" border style="width: 100%">
        <el-table-column prop="title" label="章节名称(双击)">
          <template #default="{ row }">
            <div class="flex items-center">
              <div v-if="row.isEditing" class="flex-1">
                <el-input v-model="row.title" size="small" @blur="handleTitleUpdate(row)"
                  @keyup.enter="handleTitleUpdate(row)" v-focus />
              </div>
              <div v-else class="flex-1 cursor-pointer" @dblclick="row.isEditing = true">
                {{ row.title }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="200">
          <template #default="{ row }">
            <el-collapse v-model="activeChapters">
              <div v-for="content in row.contents" :key="content.id" class="content-item p-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <el-icon class="mr-2">
                      <Document />
                    </el-icon>
                    <span>{{ content.title }}</span>
                  </div>
                  <el-button type="primary" link @click="viewContent(content)">
                    查看内容
                  </el-button>
                </div>
              </div>
              <!-- 添加内容按钮 -->
              <div v-if="isCourseTeacher(courseData.teachers) || isAdmin" class="content-item p-2 cursor-pointer hover:bg-gray-100" @click="handleAddContent(row)">
                <div class="flex items-center justify-center text-gray-400">
                  <el-icon class="mr-2">
                    <Plus />
                  </el-icon>
                  <span>添加内容</span>
                </div>
              </div>
            </el-collapse>
          </template>
        </el-table-column>
      </el-table>
    </KoiCard>

    <!-- 作业卡片 -->
    <KoiCard>
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">课程作业</span>
        </div>
      </template>
      <div class="assignments-list">
        <el-timeline>
          <el-timeline-item v-for="assignment in courseData.assignments" :key="assignment.id"
            :timestamp="assignment.deadline" placement="top">
            <el-card>
              <h4>{{ assignment.title }}</h4>
              <p class="text-gray-600">{{ assignment.description }}</p>
              <div class="mt-2 flex justify-between items-center">
                <el-tag :type="getAssignmentStatus(assignment)">
                  {{ getAssignmentStatusText(assignment) }}
                </el-tag>
                <el-button type="primary" link @click="viewAssignment(assignment)">
                  查看详情
                </el-button>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </KoiCard>

    <!-- 上传对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="uploadType === 'material' ? '上传课程资料' : '添加章节内容'" 
      width="500px"
    >
      <el-upload 
        ref="uploadRef" 
        class="upload-demo" 
        drag 
        action="#" 
        :auto-upload="false" 
        :show-file-list="true"
        :on-change="handleFileChange" 
        :limit="1"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持任意类型文件，单个文件不超过10MB
          </div>
        </template>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="courseDetail">
import { enableRowDrop } from '@/utils/sortable'
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Document, Upload, Plus } from '@element-plus/icons-vue';
import { addChapterContent, getById, updateChapterOrder, updateChapterTitle } from "@/api/system/course/index.ts";
import { koiNoticeError, koiNoticeSuccess } from "@/utils/koi.ts";
import { dayjs } from 'element-plus';
import { getPresignedDownloadUrl, getPresignedUrl, uploadMaterial, deleteMaterial } from '@/api/system/file';
import axios from 'axios';
import useUserStore from "@/stores/modules/user";
import { koiMsgBox, koiMsgError } from "@/utils/koi.ts";
import KoiCard from "@/components/KoiCard/Index.vue";

const route = useRoute();
const activeChapters = ref([]);

// 课程数据
const courseData = ref<any>({
  title: '',
  description: '',
  coverImage: '',
  status: '',
  startTime: '',
  endTime: '',
  teachers: [],
  students: [],
  materials: [],
  chapters: [],
  assignments: []
});

// 上传对话框
const dialogVisible = ref(false);
const uploadFiles = ref<any>([]);
const uploadRef = ref();
const uploadType = ref('material'); // 用于区分是上传资料还是章节内容
const currentChapter = ref<any>(null); // 当前选中的章节

// 章节排序相关
const isSort = ref(false); // 是否开启排序，默认关闭
const chapterTableId = 'chapterTable'; // 表格id

// 自定义指令：自动聚焦
const vFocus = {
  mounted: (el: any) => el.querySelector('input').focus()
};

// 处理标题更新
const handleTitleUpdate = async (row: any) => {
  try {
    if (!row.title.trim()) {
      koiNoticeError("章节标题不能为空🌻");
      return;
    }
    // TODO: 调用更新章节标题的接口
    const res: any = await updateChapterTitle({
      chapterId: row.id,
      title: row.title.trim()
    });
    if (res.code === 201) {
      koiNoticeSuccess("章节标题更新成功🌻");
      row.isEditing = false;
    } else {
      koiNoticeError(res.msg || "章节标题更新失败，请重试🌻");
    }
  } catch (error) {
    console.error(error);
    koiNoticeError("章节标题更新失败，请重试🌻");
  }
};

// 监听章节数据变化，初始化编辑状态和排序
watch(() => courseData.value.chapters, (newChapters) => {
  if (newChapters?.length) {
    // 只在数据初始化时添加 isEditing 字段，而不是每次都重新映射整个数组
    if (!newChapters[0].hasOwnProperty('isEditing')) {
      courseData.value.chapters = newChapters.map((chapter: any) => ({
        ...chapter,
        isEditing: false
      }));
    }
    
    // 只有在排序开启时才初始化排序
    if (isSort.value) {
      nextTick(() => {
        enableRowDrop(
          handleChapterSort,
          courseData.value.chapters,
          isSort.value,
          chapterTableId
        );
      });
    }
  }
}, { deep: true });

// 获取课程详情数据
const getCourseDetail = async () => {
  try {
    const id = Number(route.params.id);
    const res: any = await getById(id);
    courseData.value = res.data;
    courseData.value.startTime = dayjs(courseData.value.startTime).format('YYYY-MM-DD HH:mm:ss');
    courseData.value.endTime = dayjs(courseData.value.endTime).format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error(error);
    koiNoticeError("获取课程详情失败，请刷新重试🌻");
  }
};

// 获取状态标签类型
const getStatusType = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'not_started': 'info',
    'in_progress': 'success',
    'finished': 'warning'
  };
  return statusMap[status] || 'info';
};

// 获取状态显示文本
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'finished': '已结束'
  };
  return statusMap[status] || '未知状态';
};

// 获取作业状态
const getAssignmentStatus = (assignment: any) => {
  const now = new Date();
  const deadline = new Date(assignment.deadline);
  if (now > deadline) {
    return 'danger';
  }
  return 'warning';
};

// 获取作业状态文本
const getAssignmentStatusText = (assignment: any) => {
  const now = new Date();
  const deadline = new Date(assignment.deadline);
  if (now > deadline) {
    return '已截止';
  }
  return '进行中';
};

// 下载课程资料
const handleDownloadMaterial = async (material: any) => {
  console.log("material", material);
  const fileName = material.url.split('/').pop();
  console.log("fileName", fileName);
  const downLoadRes: any = await getPresignedDownloadUrl(fileName);
  console.log("downLoadRes", downLoadRes);
  if (downLoadRes.code !== 200) {
    koiNoticeError("获取下载链接失败");
    return false;
  }
  const url = downLoadRes.data.data.url;

  const typeMap: { [key: string]: string } = {
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'gz': 'application/x-gzip',
    'bz2': 'application/x-bzip2',
    'tar': 'application/x-tar',
  };

  //下载文件
  axios
    .get(url, {
      responseType: 'blob',
    })
    .then((res) => {
      const blob = new Blob([res.data], { type: typeMap[fileName.split('.')[1]] }) // 构造一个blob对象来处理数据，并设置文件类型

      const href = URL.createObjectURL(blob) // 创建新的URL表示指定的blob对象
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = href // 指定下载链接
      a.download = fileName.split('-')[1] // 指定下载文件名
      a.click()
      URL.revokeObjectURL(a.href) // 释放URL对象
    })


};

// 查看章节内容
const viewContent = (content: any) => {

  // TODO: 实现查看内容逻辑
  console.log('查看内容:', content);
};

// 查看作业详情
const viewAssignment = (assignment: any) => {
  // TODO: 实现查看作业详情逻辑
  console.log('查看作业:', assignment);
};

// 处理资料上传
const handleUploadMaterial = async () => {
  uploadType.value = 'material';
  dialogVisible.value = true;
};

// 处理添加内容
const handleAddContent = (chapter: any) => {
  uploadType.value = 'content';
  currentChapter.value = chapter;
  dialogVisible.value = true;
};

// 处理文件上传
const handleFileUpload = async (file: any) => {
  try {
    // 1. 获取预签名URL
    const res: any = await getPresignedUrl(file.name);
    if (res.code !== 200) {
      koiNoticeError("获取上传链接失败");
      return false;
    }

    if(uploadType.value === 'content'){
      //只允许视频和文档以及ppt类型
      if(file.raw.type !== 'video/mp4' && file.raw.type !== 'application/pdf' && file.raw.type !== 'application/vnd.ms-powerpoint' && file.raw.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation'&& file.raw.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
        koiNoticeError("只允许上传视频、文档以及ppt类型");
        return false;
      }
    }

    // 2. 使用预签名URL上传文件
    const uploadResponse = await fetch(res.data.data.url, {
      method: 'PUT',
      body: file.raw,
      headers: {
        'Content-Type': file.raw.type,
      },
    });

    if (!uploadResponse.ok) {
      koiNoticeError("文件上传失败");
      return false;
    }

    //处理type
    const type = file.raw.type;
    const typeMap: { [key: string]: string } = {
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/zip': 'zip',
      'application/x-compressed': 'zip',
      'application/x-7z-compressed': '7z',
      'application/x-rar-compressed': 'rar',
      'application/x-tar': 'tar',
      'application/x-gzip': 'gz',
      'application/x-bzip2': 'bz2',
    };

    if (uploadType.value === 'material') {
      // 3. 上传成功后，将文件信息添加到课程资料列表
      const material = {
        id: 0,
        title: file.name,
        url: decodeURIComponent(uploadResponse.url.split('?')[0]),
        fileSize: file.raw.size,
        type: typeMap[type],
        courseId: courseData.value.id
      };
      const uploadRes: any = await uploadMaterial(material);
      material.id = uploadRes.data.id;
      if (uploadRes.code !== 201) {
        koiNoticeError("文件上传失败");
        return false;
      }
      courseData.value.materials.push(material);
      koiNoticeSuccess("文件上传成功🌻");
    } else {
      // 添加章节内容
      
      const content = {
        title: file.name,
        contentUrl: decodeURIComponent(uploadResponse.url.split('?')[0]),
        type: typeMap[type],
        chapterId: currentChapter.value.id,
        order: currentChapter.value.contents.length + 1
      };
      // TODO: 调用添加章节内容的API
      const uploadRes: any = await addChapterContent(content);
      if (uploadRes.code !== 201) {
        koiNoticeError("内容添加失败");
        return false;
      }
      // 临时模拟添加内容
      if (!currentChapter.value.contents) {
        currentChapter.value.contents = [];
      }
      currentChapter.value.contents.push(content);
      koiNoticeSuccess("内容添加成功🌻");
    }
    return true;
  } catch (error) {
    console.error('上传错误:', error);
    koiNoticeError("文件上传失败，请重试🌻");
    return false;
  }
};

// 处理文件选择
const handleFileChange = async (file: File) => {
  const isSuccess = await handleFileUpload(file);
  if (isSuccess) {
    dialogVisible.value = false;
    // 清空上传列表
    uploadRef.value?.clearFiles();
  }

};

const userStore = useUserStore();
const isAdmin = computed(() => {
  return userStore.loginUser.isAdmin;
});

/** 判断当前用户是否为课程教师 */
const isCourseTeacher = (teachers: any[]) => {
  if (!teachers || teachers.length === 0) return false;
  return teachers.some(teacher => teacher.id === userStore.loginUser.id);
};

/** 删除资料 */
const handleDeleteMaterial = (row: any) => {
  koiMsgBox("您确认需要删除该资料么？")
    .then(async () => {
      try {
        await deleteMaterial(row.id);
        koiNoticeSuccess("删除成功🌻");
        // 重新加载课程详情
        getCourseDetail();
      } catch (error) {
        console.log(error);
        koiNoticeError("删除失败，请刷新重试🌻");
      }
    })
    .catch(() => {
      koiMsgError("已取消🌻");
    });
};

// 处理章节排序
const handleChapterSort = async (newOrder: number[]) => {
  try {
    const res: any = await updateChapterOrder({
      courseId: Number(route.params.id),
      chapterIds: newOrder
    });
    if (res.code === 201) {
      koiNoticeSuccess("章节顺序更新成功🌻");
      getCourseDetail(); // 重新获取课程详情
    } else {
      koiNoticeError(res.msg || "章节顺序更新失败，请重试🌻");
    }
  } catch (error) {
    console.error(error);
    koiNoticeError("章节顺序更新失败，请重试🌻");
  }
};

onMounted(() => {
  getCourseDetail();
});
</script>

<style scoped lang="scss">
.course-detail {
  padding: 20px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .content-item {
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}
</style>
