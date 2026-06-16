import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CareerEntity } from '../../domain/entities/career.entity';
import { ICareerRepository } from '../ports/output/i-career.repository';

@Injectable()
export class ChangeCareerStatusUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly repo: ICareerRepository,
  ) {}

  async execute(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<CareerEntity> {
    const career = await this.repo.findById(id);
    if (!career) {
      throw new NotFoundException(`Career with id '${id}' not found`);
    }

    if (status === 'ACTIVE') {
      career.activate();
    } else {
      career.deactivate();
    }

    return this.repo.update(career);
  }
}
