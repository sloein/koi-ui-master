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

// 初始化分片上传
export function initUpload(data: {
  chapterId: number
  fileHash: string;
  fileName: string;
  fileSize: number;
  type: string;
  contentUrl: string;
}) {
  return koi.post("/chapter/multipart/init", data);
}

// 初始化课程资料分片上传
export function initMaterialUpload(data: {
  courseId: number;
  fileHash: string;
  fileName: string;
  fileSize: number;
  type: string;
  title: string;
}) {
  return koi.post("/minio/multipart/init", data);
}

// 获取上传分片的预签名URL
export function getChunkPresignedUrl(params: {
  uploadId: string;
  fileName: string;
  partNumber: number;
}) {
  return koi.get("/minio/multipart/presignedUrl", params);
}

// 获取已上传的分片列表
export function getUploadedParts(params: {
  uploadId: string;
  fileName: string;
}) {
  return koi.get("/minio/multipart/listParts", params);
}

// 合并分片请求
export function completeMultipartUpload(data: {
  uploadId: string;
  fileName: string;
  parts: { partNumber: number; etag: string }[];
  courseId?: number;
  chapterId?: number;
  fileHash: string;
  title: string;
  type: string;
}) {
  return koi.post("/minio/multipart/complete", data);
}

// 取消分片上传
export function abortMultipartUpload(data: {
  uploadId: string;
  fileName: string;
}) {
  return koi.post("/minio/multipart/abort", data);
}


