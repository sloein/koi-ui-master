import koi from "@/utils/axios.ts";

// 获取预签名URL
export const getPresignedUrl = (fileName: any) => {
  return koi.get("/minio/presignedUrl",{fileName});
};

// 上传课程资料
export const uploadMaterial = (data: any) => {
  return koi.post("/course/upload", data);
};

