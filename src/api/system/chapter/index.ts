import koi from "@/utils/axios.ts";

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



