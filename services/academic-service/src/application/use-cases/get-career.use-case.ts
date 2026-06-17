import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CareerEntity } from '../../domain/entities/career.entity';
import { ICareerRepository } from '../ports/output/i-career.repository';

@Injectable()
export class GetCareerUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly repo: ICareerRepository,
  ) {}

  async execute(id: string): Promise<CareerEntity> {
    const career = await this.repo.findById(id);
    if (!career) {
      throw new NotFoundException(`Career with id '${id}' not found`);
    }
    return career;
  }
}
