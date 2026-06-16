import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyEntity } from '../../domain/entities/faculty.entity';
import { IFacultyRepository } from '../../application/ports/output/i-faculty.repository';
import { FacultyOrmEntity } from './faculty.orm-entity';

@Injectable()
export class FacultyRepository implements IFacultyRepository {
  constructor(
    @InjectRepository(FacultyOrmEntity)
    private readonly repo: Repository<FacultyOrmEntity>,
  ) {}

  async findById(id: string): Promise<FacultyEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findAll(): Promise<FacultyEntity[]> {
    const list = await this.repo.find();
    return list.map((o) => this.toDomain(o));
  }

  async findByCode(code: string): Promise<FacultyEntity | null> {
    const o = await this.repo.findOne({ where: { code } });
    return o ? this.toDomain(o) : null;
  }

  async findByName(name: string): Promise<FacultyEntity | null> {
    const o = await this.repo.findOne({ where: { name } });
    return o ? this.toDomain(o) : null;
  }

  async save(faculty: FacultyEntity): Promise<FacultyEntity> {
    const saved = await this.repo.save(this.toOrm(faculty));
    return this.toDomain(saved);
  }

  async update(faculty: FacultyEntity): Promise<FacultyEntity> {
    await this.repo.save(this.toOrm(faculty));
    return faculty;
  }

  async hasCareer(facultyId: string): Promise<boolean> {
    const count = await this.repo.manager
      .getRepository('careers')
      .createQueryBuilder('c')
      .where('c.faculty_id = :facultyId', { facultyId })
      .getCount();
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(o: FacultyOrmEntity): FacultyEntity {
    return new FacultyEntity(
      o.id,
      o.name,
      o.code,
      o.description,
      (o.status as 'ACTIVE' | 'INACTIVE'),
      o.createdAt,
      o.updatedAt,
    );
  }

  private toOrm(d: FacultyEntity): FacultyOrmEntity {
    const o = new FacultyOrmEntity();
    o.id = d.id;
    o.name = d.name;
    o.code = d.code;
    o.description = d.description;
    o.status = d.status;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
