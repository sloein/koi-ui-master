import koi from "@/utils/axios.ts";

// 分页查询课程列表
export function listPage(params: any) {
  return koi.get("/course", params);
}

export function listMyPage(params: any) {
  return koi.get("/course/my", params);
}

// 获取课程
export function getById(id: number) {
  return koi.get("/course/detail", { id });
}


// 创建课程
export function add(data: any) {
  return koi.post("/course", data);
}

// 更新课程
export function update(data: any) {
  return koi.post("/course/update", data);
}

// 删除课程
export function deleteById(id: number) {
  return koi.get("/course/delete", { id });
}

// 批量删除课程
export function batchDelete(ids: number[]) {
  return koi.post("/course/batchDelete", { ids });
}
