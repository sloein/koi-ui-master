import koi from "@/utils/axios.ts";
import axios from "axios";

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

export async function uploadPart(data: {
  objectName:string,
  uploadId: string;
  partNumber: number;
  chunk: File | Blob;

}) {
  const formData = new FormData();
  formData.append('chunk', data.chunk);
  formData.append('bucketName', 'studysystem');
  formData.append('objectName', data.objectName);
  formData.append('uploadID', data.uploadId); // 注意这里是 uploadID 而不是 uploadId
  formData.append('partNumber', data.partNumber.toString());
  
  const response = await axios.post('/api/chapter/multipart/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
}

 
// 完成分片上传
export function completeUpload(data: {
  uploadId: string;
  fileHash: string;
  parts: Array<{
    etag: string;
    partNumber: number;
  }>;
}) {
  return koi.post("/chapter/multipart/complete", data);
}    

