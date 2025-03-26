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
          <KoiUploadImage 
            v-model:imageUrl="courseData.coverImage" 
            @update:imageUrl="handleCoverImageUpdate"
            width="200px"
            height="200px"
            class="mr-6"
          >
            <template #content>
              <div class="flex flex-col items-center justify-center h-full">
                <el-icon class="text-3xl"><Avatar /></el-icon>
                <span class="mt-4 text-base">点击上传封面图</span>
              </div>
            </template>
          </KoiUploadImage>
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
      :close-on-click-modal="false"
      :close-on-press-escape="!isUploading"
      :show-close="!isUploading"
    >
      <div v-if="!isUploading">
        <el-form>
          <el-form-item v-if="uploadStatus.file" label="文件名称">
            <div>{{ uploadStatus.file.name }}</div>
          </el-form-item>
          <el-form-item v-if="uploadStatus.file" label="文件大小">
            <div>{{ (uploadStatus.file.size / (1024 * 1024)).toFixed(2) }} MB</div>
          </el-form-item>
          <el-form-item v-if="uploadStatus.file" label="文件类型">
            <div>{{ uploadStatus.fileType || getFileType(uploadStatus.file) }}</div>
          </el-form-item>
          <el-form-item v-if="uploadStatus.file" label="资料标题">
            <el-input v-model="uploadStatus.title" placeholder="请输入资料标题" />
          </el-form-item>
        </el-form>
        
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
              <p>文件大小超过5MB将自动使用分片上传</p>
              <p v-if="uploadType === 'content'">只允许上传视频和文档文件</p>
            </div>
          </template>
        </el-upload>
      </div>
      
      <div v-else class="upload-progress">
        <h3 class="mb-2">{{ uploadStatus.file?.name }}</h3>
        
        <div class="mb-4">
          <div class="flex justify-between mb-1">
            <span>总进度: {{ uploadStatus.progress }}%</span>
            <span>{{ formatSpeed(uploadStatus.speed) }}</span>
          </div>
          <el-progress 
            :percentage="uploadStatus.progress" 
            :status="uploadStatus.status === 'error' ? 'exception' : undefined" 
          />
          <div class="text-sm text-gray-500 mt-1" v-if="uploadStatus.remainingTime > 0">
            预计剩余时间: {{ formatRemainingTime(uploadStatus.remainingTime) }}
          </div>
        </div>
        
        <div class="chunks-progress" v-if="uploadStatus.chunks.length > 1">
          <h4 class="mb-2">分片进度</h4>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="chunk in uploadStatus.chunks" :key="chunk.index" class="chunk-item">
              <div class="flex justify-between mb-1">
                <span>分片 {{ chunk.index + 1 }}</span>
                <span>{{ chunk.progress }}%</span>
              </div>
              <el-progress 
                :percentage="chunk.progress" 
                :status="chunk.status === 'error' ? 'exception' : undefined" 
                :stroke-width="10"
              />
            </div>
          </div>
        </div>
        
        <div v-if="uploadStatus.status === 'error'" class="error-message mt-4">
          <el-alert
            title="上传失败"
            type="error"
            :description="uploadStatus.errorMessage"
            show-icon
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="isUploading && !isPaused">取消</el-button>
          <template v-if="isUploading">
            <el-button @click="cancelUpload" type="danger">终止上传</el-button>
            <el-button v-if="isPaused" @click="resumeUpload" type="primary">继续上传</el-button>
            <el-button v-else @click="pauseUpload" type="warning">暂停上传</el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="courseDetail">
import { getById, update, updateChapterOrder, updateChapterTitle } from "@/api/system/course/index.ts";
import { 
  checkFile, 
  deleteMaterial, 
  getPresignedDownloadUrl, 
  initUpload,
  initMaterialUpload,
  getChunkPresignedUrl,
  getUploadedParts,
  completeMultipartUpload,
  abortMultipartUpload
} from '@/api/system/file';
import KoiCard from "@/components/KoiCard/Index.vue";
import useUserStore from "@/stores/modules/user";
import { koiMsgBox, koiMsgError, koiMsgSuccess, koiNoticeError, koiNoticeSuccess } from "@/utils/koi.ts";
import { enableRowDrop } from '@/utils/sortable';
import { Document, Plus, UploadFilled } from '@element-plus/icons-vue';
import axios from 'axios';
import { dayjs } from 'element-plus';
import SparkMD5 from 'spark-md5';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();
const activeChapters = ref([]);

// 文件上传相关常量
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIRECT_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB，小于这个大小的文件直接上传

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

const uploadRef = ref();
const uploadType = ref('material'); // 用于区分是上传资料还是章节内容
const currentChapter = ref<any>(null); // 当前选中的章节

// 文件上传状态相关数据
const uploadStatus = ref({
  file: null as File | null,
  fileName: '',
  fileHash: '',
  uploadId: '',
  chunkSize: CHUNK_SIZE,
  chunks: [] as {
    index: number,
    start: number,
    end: number,
    progress: number,
    status: 'waiting' | 'uploading' | 'success' | 'error',
    etag: string
  }[],
  progress: 0,
  status: 'waiting' as 'waiting' | 'uploading' | 'success' | 'error' | 'paused',
  uploadedSize: 0,
  totalSize: 0,
  title: '',
  fileType: '',
  speed: 0,
  startTime: 0,
  currentTime: 0,
  remainingTime: 0,
  errorMessage: ''
});

// 上传操作控制
const isUploading = ref(false);
const isPaused = ref(false);
const abortControllers = new Map<number, AbortController>();

// 章节排序相关
const isSort = ref(false); // 是否开启排序，默认关闭
const chapterTableId = 'chapterTable'; // 表格id

// 自定义指令：自动聚焦
const vFocus = {
  mounted: (el: any) => el.querySelector('input').focus()
};

// 检查文件是否需要分片上传
const shouldUseMultipart = (file: File): boolean => {
  return file.size > MAX_DIRECT_UPLOAD_SIZE;
};

// 获取文件类型
const getFileType = (file: File): string => {
  const typeMap: { [key: string]: string } = {
    'video/mp4': 'video',
    'application/pdf': 'pdf',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };
  return typeMap[file.type] || 'unknown';
};

// 检查文件类型是否允许上传
const isAllowedFileType = (file: File, uploadType: string): boolean => {
  if (uploadType === 'content') {
    // 章节内容只允许视频和文档
    return file.type === 'video/mp4' || 
           file.type === 'application/pdf' || 
           file.type === 'application/vnd.ms-powerpoint' || 
           file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || 
           file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  // 课程资料允许所有类型
  return true;
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

// 计算文件 MD5
const calculateMD5 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024; // 2MB 分片
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      spark.append(buffer);
      currentChunk++;

      if (currentChunk < chunks) {
        // 继续读取下一个分片
        loadNext();
      } else {
        // 所有分片读取完成，计算最终的 MD5
        resolve(spark.end());
      }
    };

    reader.onerror = reject;

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      reader.readAsArrayBuffer(file.slice(start, end));
    };

    // 开始读取第一个分片
    loadNext();
  });
};

// 处理文件上传
const handleFileUpload = async (file: File) => {
  try {
    // 检查文件类型是否允许上传
    if (!isAllowedFileType(file, uploadType.value)) {
      koiNoticeError("文件类型不允许上传，请选择正确的文件类型🌻");
      return false;
    }
    
    // 重置上传状态
    resetUploadStatus(file);
    
    // 计算文件 MD5
    uploadStatus.value.status = 'uploading';
    const fileMd5 = await calculateMD5(file);
    uploadStatus.value.fileHash = fileMd5;
    
    // 文件标题默认使用文件名（不包含扩展名）
    uploadStatus.value.title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    uploadStatus.value.fileType = getFileType(file);

    // 检查文件是否存在
    const checkFileRes: any = await checkFile({
      fileHash: fileMd5,
      fileName: file.name
    });
    
    if (checkFileRes.data.exists) {
      koiNoticeSuccess("文件已存在，无需重新上传🌻");
      // 更新课程详情，显示新上传的文件
      getCourseDetail();
      return true;
    }

    // 初始化分片上传
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}-${file.name}`;
    uploadStatus.value.fileName = uniqueFileName;
    
    let initUploadRes: any;
    if (uploadType.value === 'material') {
      // 上传课程资料
      initUploadRes = await initMaterialUpload({
        courseId: Number(route.params.id),
        fileHash: fileMd5,
        fileName: uniqueFileName,
        fileSize: file.size,
        type: uploadStatus.value.fileType,
        title: uploadStatus.value.title
      });
    } else {
      // 上传章节内容
      initUploadRes = await initUpload({
        chapterId: currentChapter.value.id,
        fileHash: fileMd5,
        fileName: uniqueFileName,
        fileSize: file.size,
        type: uploadStatus.value.fileType,
        contentUrl: ''
      });
    }
    
    if (initUploadRes.code !== 201) {
      koiNoticeError(initUploadRes.message || "初始化上传失败，请重试🌻");
      return false;
    }
    
    uploadStatus.value.uploadId = initUploadRes.data.uploadID;
    
    // 检查是否有断点续传的部分
    const uploadedPartsRes: any = await getUploadedParts({
      uploadId: uploadStatus.value.uploadId,
      fileName: uploadStatus.value.fileName
    });
    
    if (uploadedPartsRes.code === 201 && uploadedPartsRes.data.parts.length > 0) {
      // 更新已上传的分片状态
      uploadedPartsRes.data.parts.forEach((part: any) => {
        const chunkIndex = part.partNumber - 1;
        if (chunkIndex >= 0 && chunkIndex < uploadStatus.value.chunks.length) {
          uploadStatus.value.chunks[chunkIndex].status = 'success';
          uploadStatus.value.chunks[chunkIndex].progress = 100;
          uploadStatus.value.chunks[chunkIndex].etag = part.etag;
          uploadStatus.value.uploadedSize += (uploadStatus.value.chunks[chunkIndex].end - uploadStatus.value.chunks[chunkIndex].start);
        }
      });
      
      // 更新总体进度
      updateTotalProgress();
    }
    
    // 开始上传分片
    isUploading.value = true;
    uploadStatus.value.startTime = Date.now();
    await uploadChunks();
    
    return true;
  } catch (error: any) {
    console.error("文件上传失败:", error);
    uploadStatus.value.status = 'error';
    uploadStatus.value.errorMessage = error.message || "文件上传失败";
    koiNoticeError("文件上传失败，请重试🌻");
    return false;
  }
};

// 重置上传状态
const resetUploadStatus = (file: File) => {
  // 取消所有进行中的请求
  abortControllers.forEach(controller => controller.abort());
  abortControllers.clear();
  
  // 计算分片数量和每个分片的大小
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  const chunksArray = [];
  
  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    chunksArray.push({
      index: i,
      start,
      end,
      progress: 0,
      status: 'waiting' as const,
      etag: ''
    });
  }
  
  // 重置上传状态
  uploadStatus.value = {
    file,
    fileName: '',
    fileHash: '',
    uploadId: '',
    chunkSize: CHUNK_SIZE,
    chunks: chunksArray,
    progress: 0,
    status: 'waiting',
    uploadedSize: 0,
    totalSize: file.size,
    title: '',
    fileType: '',
    speed: 0,
    startTime: 0,
    currentTime: 0,
    remainingTime: 0,
    errorMessage: ''
  };
  
  isUploading.value = false;
  isPaused.value = false;
};

// 上传分片
const uploadChunks = async (maxConcurrent = 3) => {
  const pendingChunks = uploadStatus.value.chunks.filter(chunk => chunk.status === 'waiting');
  let activeUploads = 0;
  
  const uploadChunk = async (chunk: typeof uploadStatus.value.chunks[0]) => {
    try {
      if (isPaused.value) return;
      
      chunk.status = 'uploading';
      activeUploads++;
      
      // 获取分片上传的预签名URL
      const presignedUrlRes: any = await getChunkPresignedUrl({
        uploadId: uploadStatus.value.uploadId,
        fileName: uploadStatus.value.fileName,
        partNumber: chunk.index + 1
      });
      
      if (presignedUrlRes.code !== 200) {
        throw new Error(presignedUrlRes.message || "获取上传链接失败");
      }
      
      const presignedUrl = presignedUrlRes.data.data.presignedUrl;
      
      // 创建 AbortController 用于取消请求
      const controller = new AbortController();
      abortControllers.set(chunk.index, controller);
      
      // 上传分片
      const chunkData = uploadStatus.value.file!.slice(chunk.start, chunk.end);
      const uploadStartTime = Date.now();
      
      console.log(presignedUrl)

      const uploadResponse = await axios.put(presignedUrl, chunkData, {
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          chunk.progress = percentCompleted;
          
          // 计算上传速度
          const currentTime = Date.now();
          const timeElapsed = (currentTime - uploadStartTime) / 1000; // 转换为秒
          if (timeElapsed > 0) {
            uploadStatus.value.speed = Math.round(progressEvent.loaded / timeElapsed); // 字节/秒
          }
          
          updateTotalProgress();
        }
      });
      
      // 上传成功
      chunk.status = 'success';
      chunk.progress = 100;
      chunk.etag = uploadResponse.headers.etag || uploadResponse.headers['ETag'];
      
      // 如果 ETag 被引号包围，去掉引号
      if (chunk.etag && (chunk.etag.startsWith('"') && chunk.etag.endsWith('"'))) {
        chunk.etag = chunk.etag.substring(1, chunk.etag.length - 1);
      }
      
      // 更新已上传大小
      uploadStatus.value.uploadedSize += (chunk.end - chunk.start);
      
      // 移除 AbortController
      abortControllers.delete(chunk.index);
      
      activeUploads--;
      
      // 检查是否有更多分片需要上传
      const nextChunk = pendingChunks.shift();
      if (nextChunk) {
        await uploadChunk(nextChunk);
      } else if (activeUploads === 0) {
        // 所有分片上传完成
        await completeUpload();
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('分片上传已取消');
        chunk.status = 'waiting';
      } else {
        console.error(`分片 ${chunk.index + 1} 上传失败:`, error);
        chunk.status = 'error';
        uploadStatus.value.status = 'error';
        uploadStatus.value.errorMessage = `分片 ${chunk.index + 1} 上传失败: ${error.message || '未知错误'}`;
      }
      
      activeUploads--;
      abortControllers.delete(chunk.index);
    }
  };
  
  // 初始启动最大并发数的上传
  const initialChunks = pendingChunks.splice(0, maxConcurrent);
  await Promise.all(initialChunks.map(chunk => uploadChunk(chunk)));
};

// 更新总体上传进度
const updateTotalProgress = () => {
  if (uploadStatus.value.totalSize === 0) return;
  
  // 计算总体进度
  const totalProgress = uploadStatus.value.chunks.reduce((acc, chunk) => {
    const chunkSize = chunk.end - chunk.start;
    return acc + (chunk.progress * chunkSize / uploadStatus.value.totalSize);
  }, 0);
  
  uploadStatus.value.progress = Math.floor(totalProgress);
  
  // 更新剩余时间估计
  uploadStatus.value.currentTime = Date.now();
  const elapsedTime = (uploadStatus.value.currentTime - uploadStatus.value.startTime) / 1000; // 秒
  
  if (uploadStatus.value.progress > 0 && elapsedTime > 0) {
    const remainingProgress = 100 - uploadStatus.value.progress;
    const progressPerSecond = uploadStatus.value.progress / elapsedTime;
    if (progressPerSecond > 0) {
      uploadStatus.value.remainingTime = Math.ceil(remainingProgress / progressPerSecond);
    }
  }
};

// 完成上传
const completeUpload = async () => {
  try {
    // 验证所有分片是否都上传成功
    const allSuccess = uploadStatus.value.chunks.every(chunk => chunk.status === 'success');
    if (!allSuccess) {
      throw new Error("部分分片上传失败，请重试");
    }
    
    // 准备提交的分片信息
    const parts = uploadStatus.value.chunks.map(chunk => ({
      partNumber: chunk.index + 1,
      etag: chunk.etag
    }));
    
    let completeRes: any;
    
    console.log(uploadStatus.value)

    if (uploadType.value === 'material') {
      // 完成课程资料上传
      completeRes = await completeMultipartUpload({
        uploadId: uploadStatus.value.uploadId,
        fileName: uploadStatus.value.fileName,
        parts,
        courseId: Number(route.params.id),
        fileHash: uploadStatus.value.fileHash,
        title: uploadStatus.value.title,
        type: uploadStatus.value.fileType
      });
    } else {
      // 完成章节内容上传
      completeRes = await completeMultipartUpload({
        uploadId: uploadStatus.value.uploadId,
        fileName: uploadStatus.value.fileName,
        parts,
        chapterId: currentChapter.value.id,
        fileHash: uploadStatus.value.fileHash,
        title: uploadStatus.value.title,
        type: uploadStatus.value.fileType
      });
    }
    
    if (completeRes.code !== 201) {
      throw new Error(completeRes.message || "完成上传失败");
    }
    
    uploadStatus.value.status = 'success';
    koiNoticeSuccess("文件上传成功🌻");
    
    // 更新课程详情，显示新上传的文件
    getCourseDetail();
    
    // 关闭上传对话框
    dialogVisible.value = false;
    uploadRef.value?.clearFiles();
    isUploading.value = false;
    
    return true;
  } catch (error: any) {
    console.error("完成上传失败:", error);
    uploadStatus.value.status = 'error';
    uploadStatus.value.errorMessage = error.message || "完成上传失败";
    koiNoticeError("完成上传失败，请重试🌻");
    return false;
  }
};

// 暂停上传
const pauseUpload = () => {
  isPaused.value = true;
  uploadStatus.value.status = 'paused';
  
  // 取消所有进行中的请求
  abortControllers.forEach(controller => controller.abort());
};

// 恢复上传
const resumeUpload = async () => {
  isPaused.value = false;
  uploadStatus.value.status = 'uploading';
  
  // 重新上传所有等待中的分片
  await uploadChunks();
};

// 取消上传
const cancelUpload = async () => {
  try {
    // 取消所有进行中的请求
    abortControllers.forEach(controller => controller.abort());
    abortControllers.clear();
    
    // 如果有 uploadId，向服务器发送取消请求
    if (uploadStatus.value.uploadId) {
      await abortMultipartUpload({
        uploadId: uploadStatus.value.uploadId,
        fileName: uploadStatus.value.fileName
      });
    }
    
    resetUploadStatus(uploadStatus.value.file!);
    koiNoticeSuccess("上传已取消🌻");
    dialogVisible.value = false;
    return true;
  } catch (error: any) {
    console.error("取消上传失败:", error);
    koiNoticeError("取消上传失败，请重试🌻");
    return false;
  }
};

// 格式化上传速度显示
const formatSpeed = (speed: number): string => {
  if (speed < 1024) {
    return `${speed} B/s`;
  } else if (speed < 1024 * 1024) {
    return `${(speed / 1024).toFixed(2)} KB/s`;
  } else {
    return `${(speed / (1024 * 1024)).toFixed(2)} MB/s`;
  }
};

// 格式化剩余时间显示
const formatRemainingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分`;
  }
};

// 处理文件选择
const handleFileChange = async (file: any) => {
  const isSuccess = await handleFileUpload(file.raw);
  if (isSuccess && uploadStatus.value.status === 'success') {
    dialogVisible.value = false;
    // 清空上传列表
    uploadRef.value?.clearFiles();
  }
};

// 处理封面更新
const handleCoverImageUpdate = (newCoverImage: string) => {
  if (newCoverImage ) {
    console.log("newCoverImage", newCoverImage);
    // 更新封面
    update({ id: courseData.value.id, coverImage: newCoverImage })
      .then(res => {
        if (res.code === 201 || res.code === 200) {
          koiMsgSuccess("封面更新成功");
          // 更新本地用户信息
          courseData.value.coverImage = newCoverImage;
        } else {
          koiMsgError(res.message || "封面更新失败");
        }
      })
      .catch(err => {
        console.error("封面更新出错:", err);
        koiMsgError("封面更新失败");
      });
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
