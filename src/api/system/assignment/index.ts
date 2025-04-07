import koi from "@/utils/axios.ts";

// 根据id获取作业详情
export function getById(id: number) {
  return koi.get(`/assignment/detail/${id}`);
}




