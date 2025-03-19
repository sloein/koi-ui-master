import koi from "@/utils/axios.ts";

// 获取预上传签名URL
export const getPresignedUrl = (fileName: any) => {
  return koi.get("/minio/presignedUrl",{fileName});
};

// 获取预下载签名URL
export const getPresignedDownloadUrl = (fileName: any) => {
  return koi.get("/minio/download",{fileName});
};

// 上传课程资料
export const uploadMaterial = (data: any) => {
  return koi.post("/course/upload", data);
};

// 删除课程资料
export const deleteMaterial = (id: any) => {
  return koi.get("/course/deleteMaterial/" + id);
};    

