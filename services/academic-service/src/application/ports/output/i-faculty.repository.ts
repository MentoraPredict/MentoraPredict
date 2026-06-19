import { FacultyEntity } from '../../../domain/entities/faculty.entity';

export const FACULTY_REPOSITORY_TOKEN = 'IFacultyRepository';

export interface IFacultyRepository {
  findById(id: string): Promise<FacultyEntity | null>;
  findAll(): Promise<FacultyEntity[]>;
  findByCode(code: string): Promise<FacultyEntity | null>;
  findByName(name: string): Promise<FacultyEntity | null>;
  save(faculty: FacultyEntity): Promise<FacultyEntity>;
  update(faculty: FacultyEntity): Promise<FacultyEntity>;
  hasCareer(facultyId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
