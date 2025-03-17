<template>
  <div class="h-full">
    <el-row class="h-100%">
      <div class="absolute top-10px right-10px flex flex-items-center">
        <KoiLanguage></KoiLanguage>
        <KoiDark></KoiDark>
      </div>
      <el-col :lg="16" :md="12" :sm="15" :xs="0" class="flex flex-items-center flex-justify-center">
        <div class="login-background w-85% h-100%"></div>
        <div class="absolute text-center select-none">
          <el-image class="w-400px h-360px mb-50px animate-float <md:hidden <lg:w-360px h-320px" :src="bg" />
          <div class="font-bold text-3xl chroma-text mb-6px text-center <lg:text-2xl <md:hidden">
            {{ $t("login.welcome") }} {{ loginTitle  }}
          </div>
          <div class="chroma-text text-lg text-center <md:hidden">{{ $t("login.description") }}</div>
        </div>
        <!-- 备案号-->
        <div class="beianhao select-none <md:hidden">
          <a class="chroma-text" href="https://beian.miit.gov.cn/" target="_blank"
            >{{ $t("login.beianhao") }}：豫ICP备2022022094号-1</a
          >
        </div>
      </el-col>
      <el-col :lg="8" :md="12" :sm="9" :xs="24" class="dark:bg-#161616 bg-gray-100 flex flex-items-center flex-justify-center flex-col">
        <div class="flex flex-items-center">
          <el-image class="rounded-full w-36px h-36px" :src="logo" />
          <div class="ml-6px font-bold text-xl">{{ loginTitle }}</div>
        </div>
        <div class="flex flex-items-center space-x-3 text-gray-400 mt-16px mb-16px">
          <span class="h-1px w-16 bg-gray-300 inline-block"></span>
          <span class="text-center">{{ isRegister ? $t("login.register") : $t("login.account") }}</span>
          <span class="h-1px w-16 bg-gray-300 inline-block"></span>
        </div>
        <!-- 登录/注册表单 -->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="w-260px" v-if="!isRegister">
          <el-form-item prop="username">
            <el-input type="text" :placeholder="$t('login.username')" :suffix-icon="User" v-model="loginForm.username" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              :placeholder="$t('login.password')"
              show-password
              :suffix-icon="Lock"
              v-model="loginForm.password"
            />
          </el-form-item>
          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              v-if="!loading"
              class="w-245px bg-[--el-color-primary]"
              round
              v-throttle:3000="handleKoiLogin"
              >{{ $t("login.in") }}</el-button
            >
            <el-button type="primary" v-else class="w-245px bg-[--el-color-primary]" round :loading="loading">{{
              $t("login.center")
            }}</el-button>
          </el-form-item>
          <div class="flex justify-between mt-2">
            <el-button type="text" @click="toggleForm">{{ $t("login.toRegister") }}</el-button>
            <!-- <el-button type="text">{{ $t("login.forgotPassword") }}</el-button> -->
          </div>
        </el-form>

        <!-- 注册表单 -->
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="w-260px" v-else>
          <el-form-item prop="username">
            <el-input type="text" :placeholder="$t('login.username')" :suffix-icon="User" v-model="registerForm.username" />
          </el-form-item>
          <el-form-item prop="nickName">
            <el-input type="text" :placeholder="$t('login.nickName')" v-model="registerForm.nickName" />
          </el-form-item>
          <el-form-item prop="realName">
            <el-input type="text" :placeholder="$t('login.realName')" v-model="registerForm.realName" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              :placeholder="$t('login.password')"
              show-password
              :suffix-icon="Lock"
              v-model="registerForm.password"
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              type="password"
              :placeholder="$t('login.confirmPassword')"
              show-password
              :suffix-icon="Lock"
              v-model="registerForm.confirmPassword"
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input type="email" :placeholder="$t('login.email')" v-model="registerForm.email">
              <template #append>
                <el-button 
                  type="primary" 
                  :disabled="!registerForm.email || isEmailSending || !isEmailValid"
                  @click="sendEmailCode"
                >{{ isEmailSending ? `${countdown}s` : $t('login.sendCode') }}</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="captcha">
            <el-input type="text" :placeholder="$t('login.captcha')" v-model="registerForm.captcha" />
          </el-form-item>
          <!-- 注册按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              v-if="!loading"
              class="w-245px bg-[--el-color-primary]"
              round
              v-throttle:3000="handleRegister"
              >{{ $t("login.register") }}</el-button
            >
            <el-button type="primary" v-else class="w-245px bg-[--el-color-primary]" round :loading="loading">{{
              $t("login.center")
            }}</el-button>
          </el-form-item>
          <div class="flex justify-between mt-2">
            <el-button type="text" @click="toggleForm">{{ $t("login.backToLogin") }}</el-button>
          </div>
        </el-form>

        <!-- github-->
        <div class="beianhao select-none lg:hidden">
          <a class="chroma-text" href="https://github.com/Sloein" target="_blank"
            >{{ $t("login.github") }}</a
          >
        </div>
      </el-col>
    </el-row>

    <KoiLoading></KoiLoading>
  </div>
</template>

<script lang="ts" setup>
import { User, Lock, Open } from "@element-plus/icons-vue";
// @ts-ignore
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";

import type { FormInstance, FormRules } from "element-plus";
import { koiMsgWarning, koiMsgError, koiMsgSuccess } from "@/utils/koi.ts";
import { useRouter } from "vue-router";
import { koiLogin, sendRegisterCaptcha, koiRegister } from "@/api/system/user/index.ts";
import useUserStore from "@/stores/modules/user.ts";
import useKeepAliveStore from "@/stores/modules/keepAlive.ts";
import { HOME_URL, LOGIN_URL } from "@/config/index.ts";
import { initDynamicRouter } from "@/routers/modules/dynamicRouter.ts";
import useTabsStore from "@/stores/modules/tabs.ts";
import logo from "@/assets/images/logo/logo.webp";
import bg from "@/assets/images/login/bg.png";
import settings from "@/settings";
import KoiDark from "./components/KoiDark.vue";
import KoiLoading from "./components/KoiLoading.vue";
import KoiLanguage from "./components/KoiLanguage.vue";
import { koiDynamicData } from "@/api/system/user";
import { getLanguage } from "@/utils/index.ts";
import useGlobalStore from "@/stores/modules/global.ts";


// 标题语言切换
const loginTitle = ref(settings.loginTitle);

loginTitle.value = computed(() => {
  return getLanguage(globalStore.language, settings.loginTitle, settings.loginEnTitle);
});

const globalStore = useGlobalStore();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();
const router = useRouter();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);

interface ILoginUser {
  username: string;
  password: string | number;

}

const loginForm = reactive<ILoginUser>({
  username: "guang",
  password: "123456",

});

let loginRules: any = reactive<FormRules<ILoginUser>>({});
loginRules = computed(() => {
  if (globalStore.language === "en") {
    return reactive<FormRules<ILoginUser>>({
      username: [{ required: true, message: "The user name cannot be empty", trigger: "blur" }],
      password: [{ required: true, message: "The password cannot be empty", trigger: "blur" }],
  
    });
  } else {
    return reactive<FormRules<ILoginUser>>({
      username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
      password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
    });
  }
});

/** 获取验证码 */
const handleCaptcha = async () => {
  // try {
  //   const res: any = await getCaptcha();
  //   loginForm.codeKey = res.data.codeKey;
  //   loginForm.captchaPicture = res.data.captchaPicture;
  // } catch (error) {
  //   console.log(error);
  //   koiMsgError("验证码获取失败🌻");
  // }
};

// const koiTimer = ref();
// // 验证码定时器
// const getCaptchaTimer = () => {
//   koiTimer.value = setInterval(() => {
//     // 执行刷新数据的方法
//     handleCaptcha();
//   }, 345 * 1000);
// };

// 进入页面加载管理员信息
onMounted(() => {
  // 获取验证码
  // handleCaptcha();
  koiDynamicData().then((res: any) => {
    userStore.setLoginUser(res.data.loginUser);
  });
  // 局部刷新定时器
  // getCaptchaTimer();
});

// onUnmounted(() => {
//   // 清除局部刷新定时器
//   clearInterval(koiTimer.value);
//   koiTimer.value = null;
// });

/** 登录 */
const handleKoiLogin = () => {
  if (!loginFormRef.value) return;
  (loginFormRef.value as any).validate(async (valid: any, fields: any) => {
    const username = loginForm.username;
    const password = loginForm.password;
 
    if (valid) {
      loading.value = true;
      try {
        // 1、执行登录接口
        const res: any = await koiLogin({ username, password });
        userStore.setToken(res.data.token);
        // userStore.setLoginUser(res.data.userInfo);
        console.log("用户信息2", userStore.loginUser);
        // 2、添加动态路由 AND 用户按钮 AND 角色信息 AND 用户个人信息
        if (userStore?.token) {
          await initDynamicRouter();
        } else {
          koiMsgWarning("请重新登录🌻");
          router.replace(LOGIN_URL);
          return;
        }
        // 3、清空 tabs数据、keepAlive缓存数据
        tabsStore.setTab([]);
        keepAliveStore.setKeepAliveName([]);

        // 4、跳转到首页
        router.replace(HOME_URL);
      } catch (error) {
        // 等待1秒关闭loading
        let loadingTime = 1;
        setInterval(() => {
          loadingTime--;
          if (loadingTime === 0) {
            loading.value = false;
          }
        }, 1000);
      }
    } else {
      console.log("登录校验失败", fields);
      koiMsgError("校验失败，信息填写有误");
    }
  });
};

// 是否显示注册表单
const isRegister = ref(false);

const registerFormRef = ref<FormInstance>();
const registerForm = reactive({
  username: "",
  nickName: "",
  realName: "",
  password: "",
  confirmPassword: "",
  email: "",
  captcha: ""
});

// 邮箱验证相关
const isEmailSending = ref(false);
const countdown = ref(60);
let timer: any = null;

// 验证邮箱是否有效
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(registerForm.email);
});

// 发送验证码
const sendEmailCode = async () => {
  if (!registerForm.email || !isEmailValid.value) {
    koiMsgWarning("请输入有效的邮箱地址");
    return;
  }
  
  isEmailSending.value = true;
  countdown.value = 60;
  
  // 这里添加发送验证码的API调用
  // await sendEmailVerificationCode(registerForm.email);
  
  // 调用发送验证码的API
  try {
    //
    const res: any = await sendRegisterCaptcha({ address: registerForm.email });
    console.log("发送验证码", res);
    koiMsgSuccess("验证码已发送到您的邮箱");
  } catch (error) {
    console.log("发送验证码失败", error);
    koiMsgError("发送验证码失败");
  }
  
  // 启动倒计时
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      isEmailSending.value = false;
    }
  }, 1000);
};

// 组件销毁时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

// 切换登录/注册表单
const toggleForm = () => {
  isRegister.value = !isRegister.value;
};

// 注册表单验证规则
let registerRules: any = reactive<FormRules<any>>({});
registerRules = computed(() => {
  if (globalStore.language === "en") {
    return reactive<FormRules<any>>({
      username: [{ required: true, message: "The user name cannot be empty", trigger: "blur" }],
      nickName: [{ required: true, message: "The nickname cannot be empty", trigger: "blur" }],
      realName: [{ required: true, message: "The real name cannot be empty", trigger: "blur" }],
      password: [{ required: true, message: "The password cannot be empty", trigger: "blur" }],
      confirmPassword: [
        { required: true, message: "Please confirm your password", trigger: "blur" },
        { 
          validator: (rule: any, value: string, callback: any) => {
            if (value !== registerForm.password) {
              callback(new Error("Passwords do not match"));
            } else {
              callback();
            }
          }, 
          trigger: "blur" 
        }
      ],
      email: [
        { required: true, message: "Email cannot be empty", trigger: "blur" },
        { type: "email", message: "Please enter a valid email address", trigger: "blur" }
      ],
      captcha: [
        { required: true, message: "Verification code cannot be empty", trigger: "blur" },
        { min: 4, max: 6, message: "Verification code should be 4-6 characters", trigger: "blur" }
      ]
    });
  } else {
    return reactive<FormRules<any>>({
      username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
      nickName: [{ required: true, message: "昵称不能为空", trigger: "blur" }],
      realName: [{ required: true, message: "真实姓名不能为空", trigger: "blur" }],
      password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
      confirmPassword: [
        { required: true, message: "请确认密码", trigger: "blur" },
        { 
          validator: (rule: any, value: string, callback: any) => {
            if (value !== registerForm.password) {
              callback(new Error("两次输入的密码不一致"));
            } else {
              callback();
            }
          }, 
          trigger: "blur" 
        }
      ],
      email: [
        { required: true, message: "邮箱不能为空", trigger: "blur" },
        { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" }
      ],
      captcha: [
        { required: true, message: "验证码不能为空", trigger: "blur" },
        { min: 4, max: 6, message: "验证码长度应为4-6位", trigger: "blur" }
      ]
    });
  }
});

// 注册方法
const handleRegister = () => {
  if (!registerFormRef.value) return;
  (registerFormRef.value as any).validate(async (valid: any, fields: any) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用真实注册API
        const registerParams = {
          username: registerForm.username,
          nickName: registerForm.nickName,
          realName: registerForm.realName,
          password: registerForm.password,
          email: registerForm.email,
          captcha: registerForm.captcha
        };
        
        const res: any = await koiRegister(registerParams);
        
        // 处理注册成功的情况
        if (res.code === 201) {
          koiMsgSuccess(res.msg || "注册成功，请登录！");
          isRegister.value = false;
          // 清空注册表单
          registerForm.username = "";
          registerForm.nickName = "";
          registerForm.realName = "";
          registerForm.password = "";
          registerForm.confirmPassword = "";
          registerForm.email = "";
          registerForm.captcha = "";
        } else {
          koiMsgError(res.data || "注册失败，请重试");
        }
        loading.value = false;
      } catch (error: any) {
        loading.value = false;
        koiMsgError(error?.response?.data?.msg || error?.message || "注册失败，请重试");
      }
    } else {
      console.log("注册校验失败", fields);
      koiMsgError("校验失败，信息填写有误");
    }
  });
};
</script>

<style lang="scss" scoped>
/** 备案号 */
.beianhao {
  position: absolute;
  bottom: 10px;
  left: auto;
  font-size: 12px;
  font-weight: bold;
}

.login-background {
  background: linear-gradient(155deg, #07070915 12%, var(--el-color-primary) 36%, #07070915 76%);
  filter: blur(100px);
}

.animate-float {
  animation: float 5s linear 0ms infinite;
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
