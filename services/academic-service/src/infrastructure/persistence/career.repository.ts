import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerEntity } from '../../domain/entities/career.entity';
import { ICareerRepository } from '../../application/ports/output/i-career.repository';
import { CareerOrmEntity } from './career.orm-entity';

@Injectable()
export class CareerRepository implements ICareerRepository {
  constructor(
    @InjectRepository(CareerOrmEntity)
    private readonly repo: Repository<CareerOrmEntity>,
  ) {}

  async findById(id: string): Promise<CareerEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findAll(): Promise<CareerEntity[]> {
    const list = await this.repo.find();
    return list.map((o) => this.toDomain(o));
  }

  async findByFaculty(facultyId: string): Promise<CareerEntity[]> {
    const list = await this.repo.find({ where: { facultyId } });
    return list.map((o) => this.toDomain(o));
  }

  async findByCode(code: string): Promise<CareerEntity | null> {
    const o = await this.repo.findOne({ where: { code } });
    return o ? this.toDomain(o) : null;
  }

  async save(career: CareerEntity): Promise<CareerEntity> {
    const saved = await this.repo.save(this.toOrm(career));
    return this.toDomain(saved);
  }

  async update(career: CareerEntity): Promise<CareerEntity> {
    await this.repo.save(this.toOrm(career));
    return career;
  }

  async hasSubjects(careerId: string): Promise<boolean> {
    const count = await this.repo.manager
      .getRepository('subjects')
      .createQueryBuilder('s')
      .where('s.career_id = :careerId', { careerId })
      .getCount();
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(o: CareerOrmEntity): CareerEntity {
    return new CareerEntity(
      o.id,
      o.name,
      o.code,
      o.description,
      o.status as 'ACTIVE' | 'INACTIVE',
      o.facultyId,
      o.durationSemesters,
      o.createdAt,
      o.updatedAt,
    );
  }

  private toOrm(d: CareerEntity): CareerOrmEntity {
    const o = new CareerOrmEntity();
    o.id = d.id;
    o.name = d.name;
    o.code = d.code;
    o.description = d.description;
    o.status = d.status;
    o.facultyId = d.facultyId;
    o.durationSemesters = d.durationSemesters;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
