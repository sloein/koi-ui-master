<template>
  <div class="course-detail">
    <!-- 基本信息卡片 -->
    <el-card class="detail-card mb-4">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">课程基本信息</span>
        </div>
      </template>
      <div class="card-content">
        <div class="flex">
          <!-- 左侧封面图 -->
          <div class="cover-image mr-6">
            <el-image 
              :src="courseData.coverImage" 
              fit="cover"
              style="width: 200px; height: 200px; border-radius: 8px;"
            />
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
                <p class="text-gray-500" >开始时间</p>
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
              <el-table-column label="操作" width="120" align="center">
                <template #default="scope">
                  <el-button type="primary" link @click="handleDownloadMaterial(scope.row)">
                    下载
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 章节内容卡片 -->
    <el-card class="detail-card mb-4">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">课程章节</span>
        </div>
      </template>
      <el-collapse v-model="activeChapters">
        <el-collapse-item v-for="chapter in courseData.chapters" :key="chapter.id" :title="chapter.title" :name="chapter.id">
          <div class="chapter-contents">
            <div v-for="content in chapter.contents" :key="content.id" class="content-item p-4 border-b">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <el-icon class="mr-2"><Document /></el-icon>
                  <span>{{ content.title }}</span>
                </div>
                <el-button type="primary" link @click="viewContent(content)">
                  查看内容
                </el-button>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 作业卡片 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">课程作业</span>
        </div>
      </template>
      <div class="assignments-list">
        <el-timeline>
          <el-timeline-item
            v-for="assignment in courseData.assignments"
            :key="assignment.id"
            :timestamp="assignment.deadline"
            placement="top"
          >
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
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="dialogVisible" title="上传课程资料" width="500px">
      <el-upload
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Document, Upload } from '@element-plus/icons-vue';
import { getById } from "@/api/system/course/index.ts";
import { koiNoticeError, koiNoticeSuccess } from "@/utils/koi.ts";
import { dayjs } from 'element-plus';
import { getPresignedUrl, uploadMaterial } from '@/api/system/file';
import axios from 'axios';


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
const handleDownloadMaterial = (material: any) => {
  
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
  dialogVisible.value = true;
};

// 处理文件上传
const handleFileUpload = async (file: any) => {
  try {
    // 1. 获取预签名URL
    const res: any = await getPresignedUrl(file.name);
    console.log("res",res);
    if (res.code !== 200) {
      koiNoticeError("获取上传链接失败");
      return false;
    }
    console.log("file",file);
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

    // 3. 上传成功后，将文件信息添加到课程资料列表
    const material = {
      title: file.name,
      url: res.data.data.url,
      fileSize: file.raw.size,
      type: file.raw.type,
      courseId: courseData.value.id
    };
    const uploadRes: any = await uploadMaterial(material);
    if (uploadRes.code !== 200) {
      koiNoticeError("文件上传失败");
      return false;
    }
    courseData.value.materials.push(material);
    koiNoticeSuccess("文件上传成功🌻");
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
  }
};

onMounted(() => {
  getCourseDetail();
});
</script>

<style scoped lang="scss">
.course-detail {
  padding: 20px;
  
  .detail-card {
    background-color: #fff;
    border-radius: 8px;
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .chapter-contents {
    .content-item {
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>
