<template>
    <div class="assignment-detail">
      <!-- 作业基本信息卡片 -->
      <KoiCard class="mb-4">
        <template #header>
          <div class="card-header">
            <span class="font-bold text-lg">作业基本信息</span>
          </div>
        </template>
        <div class="card-content">
          <div class="basic-info">
            <h2 class="text-2xl font-bold mb-2">{{ assignmentData.title }}</h2>
            
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-500">开始时间</p>
                <p>{{ assignmentData.startTime }}</p>
              </div>
              <div>
                <p class="text-gray-500">截止时间</p>
                <p>{{ assignmentData.deadline }}</p>
              </div>
              <div>
                <p class="text-gray-500">提交状态</p>
                <p>{{ assignmentData.submissionCount }} 人已提交 / {{ assignmentData.totalStudents }} 人总数</p>
              </div>
            </div>
            
            <div class="mt-4">
              <p class="text-gray-500">作业说明</p>
              <p class="whitespace-pre-wrap">{{ assignmentData.description }}</p>
            </div>
          </div>
        </div>
      </KoiCard>
  
      <!-- 提交列表卡片 -->
      <KoiCard>
        <template #header>
          <div class="card-header">
            <span class="font-bold text-lg">提交列表</span>
          </div>
        </template>
        <div class="card-content">
          <el-table :data="assignmentData.submission" border style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="120" />
            <el-table-column prop="submitTime" label="提交时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.submitTime).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit', 
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }) }}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="得分" width="100">
              <template #default="{ row }">
                <span v-if="row.score !== null">{{ row.score }}分</span>
                <el-tag v-else type="info">未批改</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="comment" label="评语" show-overflow-tooltip />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="downloadStudentSubmission(row)">
                  下载
                </el-button>
                <el-button 
                  type="success" 
                  link 
                  @click="gradeSubmission(row)"
                  v-if="canEdit"
                >
                  {{ row.score !== null ? '修改评分' : '评分' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </KoiCard>
  
      <!-- 评分对话框 -->
      <el-dialog
        v-model="gradeDialogVisible"
        title="作业评分"
        width="500px"
      >
        <div class="grade-form">
          <el-form :model="gradeForm" label-width="80px">
            <el-form-item label="得分">
              <el-input-number
                v-model="gradeForm.score"
                :min="0"
                :max="assignmentData.totalScore"
                :step="1"
              />
              <span class="ml-2">/ {{ assignmentData.totalScore }}分</span>
            </el-form-item>
            <el-form-item label="评语">
              <el-input
                v-model="gradeForm.comment"
                type="textarea"
                rows="3"
                placeholder="请输入评语"
              />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="gradeDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitGrade">
              确认
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup lang="ts" name="assignmentDetail">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { dayjs } from 'element-plus';
  import KoiCard from "@/components/KoiCard/Index.vue";
  import useUserStore from "@/stores/modules/user";
  import { koiNoticeSuccess, koiNoticeError } from "@/utils/koi";
  import { getById } from '@/api/system/assignment/index';
  import { getPresignedDownloadUrl } from '@/api/system/file';
  
  const route = useRoute();
  const userStore = useUserStore();
  
  // 作业数据
  const assignmentData = ref<any>({
    title: '',
    status: '',
    startTime: '',
    deadline: '',
    description: '',
    submissionCount: 0,
    totalStudents: 0,
    submission:[],
    courseTeachers: []
  });
  
  // 评分相关
  const gradeDialogVisible = ref(false);
  const currentGradingSubmission = ref(null);
  const gradeForm = ref({
    score: 0,
    comment: ''
  });
  
  // 能否批改
  const canEdit = computed(() => userStore.loginUser.isAdmin || userStore.loginUser.roles.includes("teacher"));
  
  // 获取作业详情
  const getAssignmentDetail = async () => {
    try {
      const id = Number(route.params.id);
      const res: any = await getById(id);
      if (res.code === 200) {
        assignmentData.value = res.data;
        // 格式化时间
        assignmentData.value.startTime = dayjs(assignmentData.value.startTime).format('YYYY-MM-DD HH:mm:ss');
        assignmentData.value.deadline = dayjs(assignmentData.value.deadline).format('YYYY-MM-DD HH:mm:ss');
      } else {
        koiNoticeError(res.msg || '获取作业详情失败');
      }
    } catch (error) {
      console.error(error);
      koiNoticeError('获取作业详情失败');
    }
  };
  
  // 下载学生提交的作业
  const downloadStudentSubmission = async (submission: any) => {
    try {
      const res: any = await getPresignedDownloadUrl(submission.fileUrl);
      if (res.code === 200) {
        window.open(res.data.url, '_blank');
      } else {
        koiNoticeError(res.msg || '获取下载链接失败');
      }
    } catch (error) {
      console.error(error);
      koiNoticeError('下载失败');
    }
  };
  
  // 评分相关方法
  const gradeSubmission = (submission: any) => {
    currentGradingSubmission.value = submission;
    gradeForm.value.score = submission.score || 0;
    gradeForm.value.comment = submission.comment || '';
    gradeDialogVisible.value = true;
  };
  
  const submitGrade = async () => {
    if (!currentGradingSubmission.value) return;
    
    try {
      // TODO: 实现提交评分逻辑
      koiNoticeSuccess('评分提交成功');
      gradeDialogVisible.value = false;
      // 刷新作业详情
      getAssignmentDetail();
    } catch (error) {
      console.error(error);
      koiNoticeError('评分提交失败');
    }
  };
  
  onMounted(() => {
    getAssignmentDetail();
  });
  </script>
  
  <style scoped lang="scss">
  .assignment-detail {
    padding: 20px;
  
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  
    .basic-info {
      .status-tag {
        margin-left: 10px;
      }
    }
  }
  </style>