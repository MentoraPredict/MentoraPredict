export interface ITeacherRolePort {
  isTeacher(userId: string): Promise<boolean>;
}
