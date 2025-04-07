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

// 检查文件是否存在
export function checkFile(data: { fileHash: string, fileName: string }) {
  return koi.post("/chapter/checkExist", data);
}

// 初始化上传
export function initUpload(data: any) {
  return koi.post("/minio/initUpload", data);
}

// 初始化分片上传
export const initMultipartUpload = (data: { filename: string, contentType: string }) => {
  return koi.post("/chapter/multipart/init", data);
};

// 上传分片
export const uploadPart = (data: FormData, onProgress?: (progressEvent: any) => void) => {
  return koi.upload("/chapter/multipart/upload", data, onProgress);
};

// 完成分片上传
export const completeMultipartUpload = (data: { 
  chapterId: string,
  uploadId: string, 
  key: string, 
  etags: string[] 
}) => {
  return koi.post("/chapter/multipart/complete", data);
};

// 中止分片上传
export const abortMultipartUpload = (data: { uploadId: string }) => {
  return koi.post("/chapter/multipart/abort", data);
};


