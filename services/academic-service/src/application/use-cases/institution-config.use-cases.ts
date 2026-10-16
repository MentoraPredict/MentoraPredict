import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AttendanceRule,
  GradingScale,
  Institution,
  InstitutionConfig,
  InstitutionLevel,
  PromotionRule,
} from '../../domain/entities/institution-config.entity';
import {
  validateAttendanceRule,
  validateGradingScale,
  validateInstitution,
  validateInstitutionLevels,
  validatePromotionRules,
} from '../../domain/services/institution-rules';
import {
  UpdateAttendanceRuleDto,
  UpdateGradingScaleDto,
  UpdateInstitutionDto,
  UpdateInstitutionLevelsDto,
  UpdatePromotionRulesDto,
} from '../dtos/institution-config.dto';
import { IInstitutionConfigRepository } from '../ports/output/i-institution-config.repository';

function failIfAny(errors: string[]): void {
  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }
}

const emptyToNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

@Injectable()
export class GetInstitutionConfigUseCase {
  constructor(
    @Inject('IInstitutionConfigRepository')
    private readonly repo: IInstitutionConfigRepository,
  ) {}

  async execute(): Promise<InstitutionConfig> {
    const [institution, levelCatalog, levels, gradingScale, attendanceRule, promotionRules] =
      await Promise.all([
        this.repo.getInstitution(),
        this.repo.listLevelCatalog(),
        this.repo.getLevels(),
        this.repo.getGradingScale(),
        this.repo.getAttendanceRule(),
        this.repo.getPromotionRules(),
      ]);

    return { institution, levelCatalog, levels, gradingScale, attendanceRule, promotionRules };
  }
}

@Injectable()
export class UpdateInstitutionUseCase {
  constructor(
    @Inject('IInstitutionConfigRepository')
    private readonly repo: IInstitutionConfigRepository,
  ) {}

  async execute(dto: UpdateInstitutionDto): Promise<Institution> {
    const current = await this.repo.getInstitution();
    const next: Institution = {
      ...current,
      amie: emptyToNull(dto.amie)?.toUpperCase() ?? null,
      name: dto.name.trim(),
      sustentation: dto.sustentation,
      regime: dto.regime,
      zone: emptyToNull(dto.zone),
      district: emptyToNull(dto.district),
      address: emptyToNull(dto.address),
      phone: emptyToNull(dto.phone),
      email: emptyToNull(dto.email),
      rectorName: emptyToNull(dto.rectorName),
      logoUrl: emptyToNull(dto.logoUrl),
    };

    failIfAny(validateInstitution(next));
    return this.repo.saveInstitution(next);
  }
}

@Injectable()
export class UpdateInstitutionLevelsUseCase {
  constructor(
    @Inject('IInstitutionConfigRepository')
    private readonly repo: IInstitutionConfigRepository,
  ) {}

  async execute(dto: UpdateInstitutionLevelsDto): Promise<InstitutionLevel[]> {
    const catalog = await this.repo.listLevelCatalog();
    const levels: InstitutionLevel[] = dto.levels.map((l) => ({
      levelCode: l.levelCode,
      isActive: l.isActive,
      shifts: [...new Set(l.shifts)],
    }));

    failIfAny(validateInstitutionLevels(levels, catalog));
    return this.repo.replaceLevels(levels);
  }
}

@Injectable()
export class UpdateGradingScaleUseCase {
  constructor(
    @Inject('IInstitutionConfigRepository')
    private readonly repo: IInstitutionConfigRepository,
  ) {}

  async execute(dto: UpdateGradingScaleDto): Promise<GradingScale> {
    const current = await this.repo.getGradingScale();
    const next: GradingScale = {
      id: current.id,
      name: dto.name.trim(),
      minValue: dto.minValue,
      maxValue: dto.maxValue,
      passingGrade: dto.passingGrade,
      decimals: dto.decimals,
      bands: dto.bands.map((b) => ({
        code: b.code.trim().toUpperCase(),
        label: b.label.trim(),
        minValue: b.minValue,
        maxValue: b.maxValue,
      })),
    };

    const errors = validateGradingScale(next);
    // Las reglas de promoción ya guardadas deben seguir cabiendo en la escala nueva.
    errors.push(
      ...validatePromotionRules(
        await this.repo.getPromotionRules(),
        await this.repo.listLevelCatalog(),
        next,
      ),
    );
    failIfAny(errors);

    return this.repo.saveGradingScale(next);
  }
}

@Injectable()
export class UpdateAttendanceRuleUseCase {
  constructor(
    @Inject('IInstitutionConfigRepository')
    private readonly repo: IInstitutionConfigRepository,
  ) {}

  async execute(dto: UpdateAttendanceRuleDto): Promise<AttendanceRule> {
    const next: AttendanceRule = {
      maxUnjustifiedPct: dto.maxUnjustifiedPct,
      warningPcts: [...dto.warningPcts].sort((a, b) => a - b),
      appliesFromLevelOrder: dto.appliesFromLevelOrder,
      justificationDays: dto.justificationDays ?? null,
    };

    const errors = validateAttendanceRule(next);
    const catalog = await this.repo.listLevelCatalog();
    const maxOrder = Math.max(...catalog.map((l) => l.sortOrder));
    if (next.appliesFromLevelOrder > maxOrder) {
      errors.push('El nivel desde el que aplica la regla no existe en el catálogo');
    }
    failIfAny(errors);

    return this.repo.saveAttendanceRule(next);
  }
}

@Injectable()
export class UpdatePromotionRulesUseCase {
  constructor(
    @Inject('IInstitutionConfigRepository')
    private readonly repo: IInstitutionConfigRepository,
  ) {}

  async execute(dto: UpdatePromotionRulesDto): Promise<PromotionRule[]> {
    const rules: PromotionRule[] = dto.rules.map((r) => ({
      levelCode: r.levelCode,
      minAverage: r.minAverage,
      allowsSupplementary: r.allowsSupplementary,
      repetitionPolicy: r.repetitionPolicy,
    }));

    const [catalog, scale] = await Promise.all([
      this.repo.listLevelCatalog(),
      this.repo.getGradingScale(),
    ]);
    failIfAny(validatePromotionRules(rules, catalog, scale));

    return this.repo.replacePromotionRules(rules);
  }
}
