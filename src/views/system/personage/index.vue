<template>
  <div class="p-4">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24" class="mb-4">
        <el-card shadow="hover">
          <div class="text-center mb-5">
            <KoiUploadImage v-model:imageUrl="mine.avatar" @update:imageUrl="handleAvatarUpdate">
              <template #content>
                <div class="flex flex-col items-center justify-center h-full">
                  <el-icon><Avatar /></el-icon>
                  <span class="mt-2">点击上传头像</span>
                </div>
              </template>
            </KoiUploadImage>
            <h3 class="mt-3 font-bold">{{ mine.nickName || mine.username }}</h3>
          </div>
          <div class="text-13px text-#303133 dark:text-#E5EAF3">
            <div class="flex flex-justify-between flex-wrap mt-20px p-y-12px border-b border-gray-200 dark:border-gray-700">
              <div class="flex flex-items-center">
                <el-icon size="15"> <UserFilled /> </el-icon>
                <div class="p-l-2px">登录名称</div>
              </div>
              <div v-text="mine.username"></div>
            </div>
            <div class="flex flex-justify-between flex-wrap p-y-12px border-b border-gray-200 dark:border-gray-700">
              <div class="flex flex-items-center">
                <el-icon size="15"> <User /> </el-icon>
                <div class="p-l-2px">用户昵称</div>
              </div>
              <div v-text="mine.nickName || '未设置'"></div>
            </div>
            <!-- <div class="flex flex-justify-between flex-wrap p-y-12px border-b border-gray-200 dark:border-gray-700">
              <div class="flex flex-items-center">
                <el-icon size="15"> <UserFilled /> </el-icon>
                <div class="p-l-2px">真实姓名</div>
              </div>
              <div v-text="mine.realName || '未设置'"></div>
            </div> -->
           
            <div class="flex flex-justify-between flex-wrap p-y-12px border-b border-gray-200 dark:border-gray-700">
              <div class="flex flex-items-center">
                <el-icon size="15"> <Message /> </el-icon>
                <div class="p-l-2px">用户邮箱</div>
              </div>
              <div v-text="mine.email || '未设置'"></div>
            </div>
 
            <div class="flex flex-justify-between flex-wrap p-y-12px border-b border-gray-200 dark:border-gray-700">
              <div class="flex flex-items-center">
                <el-icon size="15"> <Collection /> </el-icon>
                <div class="p-l-2px">所属角色</div>
              </div>
              <div v-text="mine.roleName || '普通用户'"></div>
            </div>
 
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card shadow="hover" :body-style="{ 'padding-top': '6px' }">
          <el-tabs v-model="activeName">
            <el-tab-pane label="基本资料" name="first">
              <el-form ref="mineFormRef" :rules="mineRules" :model="mineForm" label-width="80px" status-icon>
                <el-row>
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                    <el-form-item label="登录名称" prop="username">
                      <el-input v-model="mineForm.username" placeholder="请输入登录名称" clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                    <el-form-item label="用户昵称" prop="nickName">
                      <el-input v-model="mineForm.nickName" placeholder="请输入用户昵称" clearable />
                    </el-form-item>
                  </el-col>
                  <!-- <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                    <el-form-item label="真实姓名" prop="realName">
                      <el-input v-model="mineForm.realName" placeholder="请输入真实姓名" clearable />
                    </el-form-item>
                  </el-col> -->
          
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="mineForm.email" placeholder="请输入邮箱" clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                    <el-form-item label="性别" prop="sex">
                      <el-radio-group v-model="mineForm.sex" placeholder="请选择性别">
                        <el-radio value="1" border>男</el-radio>
                        <el-radio value="2" border>女</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }" class="mt-6px">
                    <el-form-item>
                      <el-button type="primary" @click="handleMineSave">保存</el-button>
                      <el-button type="danger" @click="resetMineForm">重置</el-button>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-tab-pane>
            <!-- <el-tab-pane label="修改密码" name="second">
              <el-form ref="pwdFormRef" :rules="pwdRules" :model="pwdForm" label-width="80px" status-icon>
                <el-row>
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                    <el-form-item label="当前密码" prop="password">
                      <el-input v-model="pwdForm.password" placeholder="请输入当前密码" show-password clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                    <el-form-item label="新密码" prop="newPassword">
                      <el-input v-model="pwdForm.newPassword" placeholder="请输入新密码" show-password clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }">
                    <el-form-item label="确认密码" prop="confirmPassword">
                      <el-input v-model="pwdForm.confirmPassword" placeholder="请再次输入新密码" show-password clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :sm="{ span: 24 }" :xs="{ span: 24 }" class="mt-6px">
                    <el-form-item>
                      <el-button type="primary" @click="handlePwdSave">更新密码</el-button>
                      <el-button type="danger" @click="resetPwdForm">重置</el-button>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-tab-pane> -->
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="personagePage">
import { nextTick, ref, reactive, onMounted } from "vue";
import { koiMsgError, koiMsgSuccess } from "@/utils/koi.ts";
import useUserStore from "@/stores/modules/user";
import { updateUserInfo, updatePassword } from "@/api/system/user/index.ts";

const userStore = useUserStore();

// 个人信息
const mine = ref({
  avatar: "",
  username: "",
  nickName: "",
  // realName: "",
  phone: "",
  email: "",
  roleName: "",
});

const initUserInfo = () => {
  if(userStore.loginUser) {
    console.log(userStore.loginUser);
    mine.value = userStore.loginUser;
    mineForm.value = {
      username: userStore.loginUser.username || "",
      nickName: userStore.loginUser.nickName || "",
      // realName: userStore.loginUser.realName || "",
      phone: userStore.loginUser.phone || "",
      email: userStore.loginUser.email || "",
      sex: userStore.loginUser.sex || "3"
    };
  }
}

// 处理头像更新
const handleAvatarUpdate = (newAvatar: string) => {
  if (newAvatar ) {
    console.log("newAvatar", newAvatar);
    // 更新头像
    updateUserInfo({ avatar: newAvatar })
      .then(res => {
        if (res.code === 201 || res.code === 200) {
          koiMsgSuccess("头像更新成功");
          // 更新本地用户信息
          userStore.setLoginUser({
            ...userStore.loginUser,
            avatar: newAvatar
          });
        } else {
          koiMsgError(res.message || "头像更新失败");
        }
      })
      .catch(err => {
        console.error("头像更新出错:", err);
        koiMsgError("头像更新失败");
      });
  }
};

// 页面加载时获取用户信息
onMounted(() => {
  initUserInfo();
});

// el-card标签选择name
const activeName = ref("first");

/** 基本资料 Begin  */

// form表单Ref
const mineFormRef = ref<any>();
// form表单
let mineForm = ref<any>({
  username: "",
  nickName: "",
  // realName: "",

  email: "",
  sex: "3"
});
/** 清空表单数据 */
const resetMineForm = () => {
  // 等待 DOM 更新完成
  nextTick(() => {
    if (mineFormRef.value) {
      // 重置该表单项，将其值重置为初始值，并移除校验结果
      mineFormRef.value.resetFields();
    }
  });     
  // 重新加载用户信息
  initUserInfo();
};
/** 表单规则 */
const mineRules = reactive({
  username: [{ required: true, message: "请输入登录名称", trigger: "blur" }],
  nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  // realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
  ]
});

/** 保存 */
const handleMineSave = () => {
  if (!mineFormRef.value) return;
  (mineFormRef.value as any).validate(async (valid: any) => {
    if (valid) {
      try {
        const res = await updateUserInfo(mineForm.value);
        if (res.code === 201) {
          koiMsgSuccess("个人信息修改成功");
          // 更新本地存储的用户信息
          userStore.setLoginUser({
            ...userStore.loginUser,
            ...mineForm.value
          });
          // 刷新页面显示
          initUserInfo();
        } else {
          koiMsgError(res.message || "修改失败，请重试");
        }
      } catch (error) {
        console.error("保存用户信息出错:", error);
        koiMsgError("修改失败，请重试");
      }
    } else {
      koiMsgError("验证失败，请检查填写内容");
    }
  });
};

/** 基本资料 End  */

/** 修改密码 Begin  */
// form表单Ref
const pwdFormRef = ref<any>();
// form表单
let pwdForm = ref<any>({
  password: "",
  newPassword: "",
  confirmPassword: ""
});

/** 清空表单数据 */
const resetPwdForm = () => {
  // 等待 DOM 更新完成
  nextTick(() => {
    if(pwdFormRef.value) {
      // 重置该表单项，将其值重置为初始值，并移除校验结果
      pwdFormRef.value.resetFields();
    }
  });    
  pwdForm.value = {
    password: "",
    newPassword: "",
    confirmPassword: ""
  };
};

/** 表单规则 */
const pwdRules = reactive({
  password: [{ required: true, message: "请输入当前密码", trigger: "change" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "change" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "change" }
  ],
  confirmPassword: [
    { required: true, message: "请输入确认密码", trigger: "change" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== pwdForm.value.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "change"
    }
  ]
});

/** 保存密码 */
const handlePwdSave = () => {
  if (!pwdFormRef.value) return;
  (pwdFormRef.value as any).validate(async (valid: any) => {
    if (valid) {
      try {
        const res = await updatePassword({
          oldPassword: pwdForm.value.password,
          newPassword: pwdForm.value.newPassword
        });
        
        if (res.code === 201) {
          koiMsgSuccess("密码修改成功，请重新登录");
          // 清空密码表单
          resetPwdForm();
        } else {
          koiMsgError(res.message || "密码修改失败，请重试");
        }
      } catch (error) {
        console.error("修改密码出错:", error);
        koiMsgError("密码修改失败，请重试");
      }
    } else {
      koiMsgError("验证失败，请检查填写内容");
    }
  });
};

/** 修改密码 End  */
</script>

<style lang="scss" scoped>
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.koi-upload-image) {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}
</style>
