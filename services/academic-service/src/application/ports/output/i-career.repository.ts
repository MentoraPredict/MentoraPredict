import { CareerEntity } from '../../../domain/entities/career.entity';

export const CAREER_REPOSITORY_TOKEN = 'ICareerRepository';

export interface ICareerRepository {
  findById(id: string): Promise<CareerEntity | null>;
  findAll(): Promise<CareerEntity[]>;
  findByFaculty(facultyId: string): Promise<CareerEntity[]>;
  findByCode(code: string): Promise<CareerEntity | null>;
  save(career: CareerEntity): Promise<CareerEntity>;
  update(career: CareerEntity): Promise<CareerEntity>;
  hasSubjects(careerId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
