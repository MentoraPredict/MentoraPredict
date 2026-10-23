import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import {
  AttendanceRule,
  DEFAULT_INSTITUTION_ID,
  EducationLevel,
  EvaluationMode,
  GradingScale,
  Institution,
  InstitutionLevel,
  PromotionRule,
  RepetitionPolicy,
  Shift,
  Sustentation,
} from '../../domain/entities/institution-config.entity';
import { SchoolRegime } from '../../domain/entities/school-year.entity';
import { IInstitutionConfigRepository } from '../../application/ports/output/i-institution-config.repository';
import {
  AttendanceRuleOrmEntity,
  EducationLevelOrmEntity,
  GradingScaleBandOrmEntity,
  GradingScaleOrmEntity,
  InstitutionLevelOrmEntity,
  InstitutionOrmEntity,
  PromotionRuleOrmEntity,
} from './institution-config.orm-entities';

const ID = DEFAULT_INSTITUTION_ID;

@Injectable()
export class InstitutionConfigRepository implements IInstitutionConfigRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async getInstitution(): Promise<Institution> {
    const o = await this.ds.getRepository(InstitutionOrmEntity).findOne({ where: { id: ID } });
    if (!o) throw new NotFoundException('La institución no está configurada');
    return {
      id: o.id,
      amie: o.amie,
      name: o.name,
      sustentation: o.sustentation as Sustentation,
      regime: o.regime as SchoolRegime,
      zone: o.zone,
      district: o.district,
      address: o.address,
      phone: o.phone,
      email: o.email,
      rectorName: o.rectorName,
      logoUrl: o.logoUrl,
    };
  }

  async saveInstitution(i: Institution): Promise<Institution> {
    const repo = this.ds.getRepository(InstitutionOrmEntity);
    const o = await repo.findOneByOrFail({ id: ID });
    Object.assign(o, {
      amie: i.amie,
      name: i.name,
      sustentation: i.sustentation,
      regime: i.regime,
      zone: i.zone,
      district: i.district,
      address: i.address,
      phone: i.phone,
      email: i.email,
      rectorName: i.rectorName,
      logoUrl: i.logoUrl,
    });
    await repo.save(o);
    return this.getInstitution();
  }

  async listLevelCatalog(): Promise<EducationLevel[]> {
    const list = await this.ds
      .getRepository(EducationLevelOrmEntity)
      .find({ order: { sortOrder: 'ASC' } });
    return list.map((l) => ({
      code: l.code,
      name: l.name,
      levelGroup: l.levelGroup as EducationLevel['levelGroup'],
      sortOrder: l.sortOrder,
      evaluationMode: l.evaluationMode as EvaluationMode,
      allowsSupplementary: l.allowsSupplementary,
    }));
  }

  async getLevels(): Promise<InstitutionLevel[]> {
    const list = await this.ds
      .getRepository(InstitutionLevelOrmEntity)
      .find({ where: { institutionId: ID } });
    return list.map((l) => ({
      levelCode: l.levelCode,
      isActive: l.isActive,
      shifts: l.shifts as Shift[],
    }));
  }

  async replaceLevels(levels: InstitutionLevel[]): Promise<InstitutionLevel[]> {
    await this.ds.transaction(async (em) => {
      const repo = em.getRepository(InstitutionLevelOrmEntity);
      await repo.delete({ institutionId: ID });
      await repo.save(
        levels.map((l) =>
          repo.create({
            institutionId: ID,
            levelCode: l.levelCode,
            isActive: l.isActive,
            shifts: l.shifts,
          }),
        ),
      );
    });
    return this.getLevels();
  }

  async getGradingScale(): Promise<GradingScale> {
    const scale = await this.ds
      .getRepository(GradingScaleOrmEntity)
      .findOne({ where: { institutionId: ID, isDefault: true } });
    if (!scale) throw new NotFoundException('La escala de calificaciones no está configurada');

    const bands = await this.ds
      .getRepository(GradingScaleBandOrmEntity)
      .find({ where: { scaleId: scale.id }, order: { sortOrder: 'ASC' } });

    return {
      id: scale.id,
      name: scale.name,
      minValue: Number(scale.minValue),
      maxValue: Number(scale.maxValue),
      passingGrade: Number(scale.passingGrade),
      decimals: scale.decimals,
      bands: bands.map((b) => ({
        code: b.code,
        label: b.label,
        minValue: Number(b.minValue),
        maxValue: Number(b.maxValue),
      })),
    };
  }

  async saveGradingScale(scale: GradingScale): Promise<GradingScale> {
    const current = await this.getGradingScale();
    await this.ds.transaction(async (em) => {
      await em.getRepository(GradingScaleOrmEntity).update(current.id, {
        name: scale.name,
        minValue: String(scale.minValue),
        maxValue: String(scale.maxValue),
        passingGrade: String(scale.passingGrade),
        decimals: scale.decimals,
      });
      const bandRepo = em.getRepository(GradingScaleBandOrmEntity);
      await bandRepo.delete({ scaleId: current.id });
      const sorted = [...scale.bands].sort((a, b) => a.minValue - b.minValue);
      await bandRepo.save(
        sorted.map((b, index) =>
          bandRepo.create({
            id: randomUUID(),
            scaleId: current.id,
            code: b.code,
            label: b.label,
            minValue: String(b.minValue),
            maxValue: String(b.maxValue),
            sortOrder: index + 1,
          }),
        ),
      );
    });
    return this.getGradingScale();
  }

  async getAttendanceRule(): Promise<AttendanceRule> {
    const o = await this.ds
      .getRepository(AttendanceRuleOrmEntity)
      .findOne({ where: { institutionId: ID } });
    if (!o) throw new NotFoundException('La regla de asistencia no está configurada');
    return {
      maxUnjustifiedPct: Number(o.maxUnjustifiedPct),
      warningPcts: o.warningPcts,
      appliesFromLevelOrder: o.appliesFromLevelOrder,
      justificationDays: o.justificationDays,
    };
  }

  async saveAttendanceRule(rule: AttendanceRule): Promise<AttendanceRule> {
    await this.ds.getRepository(AttendanceRuleOrmEntity).update(
      { institutionId: ID },
      {
        maxUnjustifiedPct: String(rule.maxUnjustifiedPct),
        warningPcts: [...rule.warningPcts].sort((a, b) => a - b),
        appliesFromLevelOrder: rule.appliesFromLevelOrder,
        justificationDays: rule.justificationDays,
      },
    );
    return this.getAttendanceRule();
  }

  async getPromotionRules(): Promise<PromotionRule[]> {
    const list = await this.ds
      .getRepository(PromotionRuleOrmEntity)
      .find({ where: { institutionId: ID } });
    return list.map((r) => ({
      levelCode: r.levelCode,
      minAverage: Number(r.minAverage),
      allowsSupplementary: r.allowsSupplementary,
      supplementaryMinAverage: Number(r.supplementaryMinAverage),
      repetitionPolicy: r.repetitionPolicy as RepetitionPolicy,
    }));
  }

  async replacePromotionRules(rules: PromotionRule[]): Promise<PromotionRule[]> {
    await this.ds.transaction(async (em) => {
      const repo = em.getRepository(PromotionRuleOrmEntity);
      await repo.delete({ institutionId: ID });
      await repo.save(
        rules.map((r) =>
          repo.create({
            institutionId: ID,
            levelCode: r.levelCode,
            minAverage: String(r.minAverage),
            allowsSupplementary: r.allowsSupplementary,
            supplementaryMinAverage: String(r.supplementaryMinAverage),
            repetitionPolicy: r.repetitionPolicy,
          }),
        ),
      );
    });
    return this.getPromotionRules();
  }
}
