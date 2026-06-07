import { ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { randomUUID as uuidv4 } from 'crypto';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { EnrollStudentDto } from '../dtos/enroll-student.dto';

export class EnrollStudentUseCase {
  constructor(
    @Inject('IEnrollmentRepository') private readonly enrollRepo: IEnrollmentRepository,
    @Inject('ISubjectRepository')    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(dto: EnrollStudentDto): Promise<EnrollmentEntity> {
    const subject = await this.subjectRepo.findById(dto.subjectId);
    if (!subject || !subject.isActive) throw new NotFoundException('Subject not found or inactive');

    const existing = await this.enrollRepo.findByStudentAndSubject(dto.studentId, dto.subjectId);
    if (existing && existing.status === 'ACTIVE') {
      throw new ConflictException('Student is already enrolled in this subject');
    }

    const enrollment = new EnrollmentEntity(
      uuidv4(), dto.studentId, dto.subjectId, 'ACTIVE', new Date(), new Date(),
    );
    return this.enrollRepo.save(enrollment);
  }
}
