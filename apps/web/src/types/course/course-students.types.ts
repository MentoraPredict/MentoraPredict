import type { AppUser } from "@/types/user/user.types";

export interface CourseEnrolledStudent {
  id: string;
  user: AppUser;
  average: number;
  attendance: number;
  isEnrolled: boolean;
}
