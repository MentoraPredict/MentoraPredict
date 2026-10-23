import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Consent,
  ConsentPurpose,
  GuardianLink,
  GuardianRelation,
  Sex,
  StudentProfile,
} from '../../domain/entities/people.entity';
import { IPeopleRepository } from '../../application/ports/output/i-people.repository';
import {
  ConsentOrmEntity,
  GuardianStudentOrmEntity,
  StudentProfileOrmEntity,
} from './people.orm-entities';

@Injectable()
export class PeopleRepository implements IPeopleRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
    const o = await this.ds.getRepository(StudentProfileOrmEntity).findOne({ where: { studentId } });
    return o ? this.toProfile(o) : null;
  }

  async saveStudentProfile(profile: StudentProfile): Promise<StudentProfile> {
    const repo = this.ds.getRepository(StudentProfileOrmEntity);
    await repo.save(repo.create(profile));
    return this.toProfile(await repo.findOneByOrFail({ studentId: profile.studentId }));
  }

  async listGuardiansOfStudent(studentId: string): Promise<GuardianLink[]> {
    const list = await this.ds
      .getRepository(GuardianStudentOrmEntity)
      .find({ where: { studentId }, order: { isPrimary: 'DESC', createdAt: 'ASC' } });
    return list.map(this.toLink);
  }

  async listStudentsOfGuardian(guardianId: string): Promise<GuardianLink[]> {
    const list = await this.ds
      .getRepository(GuardianStudentOrmEntity)
      .find({ where: { guardianId }, order: { createdAt: 'ASC' } });
    return list.map(this.toLink);
  }

  async findGuardianLink(guardianId: string, studentId: string): Promise<GuardianLink | null> {
    const o = await this.ds
      .getRepository(GuardianStudentOrmEntity)
      .findOne({ where: { guardianId, studentId } });
    return o ? this.toLink(o) : null;
  }

  async saveGuardianLink(link: GuardianLink, demoteGuardianIds: string[]): Promise<GuardianLink> {
    await this.ds.transaction(async (em) => {
      const repo = em.getRepository(GuardianStudentOrmEntity);
      // El índice único admite un solo principal: primero se degrada al anterior.
      for (const guardianId of demoteGuardianIds) {
        await repo.update({ guardianId, studentId: link.studentId }, { isPrimary: false });
      }
      await repo.save(repo.create(link));
    });
    return (await this.findGuardianLink(link.guardianId, link.studentId)) as GuardianLink;
  }

  async deleteGuardianLink(guardianId: string, studentId: string): Promise<void> {
    await this.ds.getRepository(GuardianStudentOrmEntity).delete({ guardianId, studentId });
  }

  async listConsents(studentId: string): Promise<Consent[]> {
    const list = await this.ds
      .getRepository(ConsentOrmEntity)
      .find({ where: { studentId }, order: { grantedAt: 'DESC' } });
    return list.map(this.toConsent);
  }

  async findActiveConsent(studentId: string, purpose: ConsentPurpose): Promise<Consent | null> {
    const o = await this.ds
      .getRepository(ConsentOrmEntity)
      .createQueryBuilder('c')
      .where('c.studentId = :studentId AND c.purpose = :purpose AND c.revokedAt IS NULL', {
        studentId,
        purpose,
      })
      .getOne();
    return o ? this.toConsent(o) : null;
  }

  async saveConsent(consent: Consent): Promise<Consent> {
    const repo = this.ds.getRepository(ConsentOrmEntity);
    await repo.save(repo.create(consent));
    return this.toConsent(await repo.findOneByOrFail({ id: consent.id }));
  }

  async revokeConsent(id: string, revokedAt: Date): Promise<void> {
    await this.ds.getRepository(ConsentOrmEntity).update(id, { revokedAt });
  }

  private toProfile = (o: StudentProfileOrmEntity): StudentProfile => ({
    studentId: o.studentId,
    birthDate: o.birthDate ? String(o.birthDate).slice(0, 10) : null,
    sex: o.sex as Sex | null,
    nationality: o.nationality,
    address: o.address,
    hasSpecialNeeds: o.hasSpecialNeeds,
    specialNeedsNotes: o.specialNeedsNotes,
    emergencyContactName: o.emergencyContactName,
    emergencyContactPhone: o.emergencyContactPhone,
    previousSchool: o.previousSchool,
  });

  private toLink = (o: GuardianStudentOrmEntity): GuardianLink => ({
    guardianId: o.guardianId,
    studentId: o.studentId,
    relation: o.relation as GuardianRelation,
    isPrimary: o.isPrimary,
    canPickup: o.canPickup,
    livesWith: o.livesWith,
  });

  private toConsent = (o: ConsentOrmEntity): Consent => ({
    id: o.id,
    studentId: o.studentId,
    guardianId: o.guardianId,
    purpose: o.purpose as ConsentPurpose,
    noticeVersion: o.noticeVersion,
    grantedAt: o.grantedAt,
    revokedAt: o.revokedAt,
  });
}
