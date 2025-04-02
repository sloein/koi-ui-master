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

// 更新章节顺序
export function updateChapterOrder(data: {
  courseId: number;  // 课程ID
  chapterIds: number[];  // 章节ID数组，按新的顺序排列
}) {
  return koi.post("/course/chapter/updateOrder", data);
}


// 更新章节标题
export function updateChapterTitle(data: {
  chapterId: number;  // 章节ID
  title: string;  // 新的章节标题
}) {
  return koi.post("/course/chapter/updateTitle", data);
}

// 增加章节内容
export function addChapterContent(data: {
  chapterId: number;  // 章节ID
  title: string;  // 新的章节内容
  contentUrl: string;  // 新的章节内容
  type: string;  // 新的章节类型
  order: number;  // 新的章节顺序
}) {
  return koi.post("/chapter/addContent", data);
}


