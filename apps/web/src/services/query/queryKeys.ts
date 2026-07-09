export const queryKeys = {
  teacherCourses: (teacherId: string) => ["teacher-courses", teacherId] as const,
  courseCreationOptions: () => ["course-creation-options"] as const,
  students: () => ["students"] as const,
};
