import {
  AttendanceRule,
  EducationLevel,
  GradingScale,
  Institution,
  InstitutionLevel,
  PromotionRule,
} from '../../../domain/entities/institution-config.entity';

export const INSTITUTION_CONFIG_REPOSITORY_TOKEN = 'IInstitutionConfigRepository';

export interface IInstitutionConfigRepository {
  getInstitution(): Promise<Institution>;
  saveInstitution(institution: Institution): Promise<Institution>;

  listLevelCatalog(): Promise<EducationLevel[]>;
  getLevels(): Promise<InstitutionLevel[]>;
  replaceLevels(levels: InstitutionLevel[]): Promise<InstitutionLevel[]>;

  getGradingScale(): Promise<GradingScale>;
  /** Reemplaza la escala y sus rangos en una sola transacción. */
  saveGradingScale(scale: GradingScale): Promise<GradingScale>;

  getAttendanceRule(): Promise<AttendanceRule>;
  saveAttendanceRule(rule: AttendanceRule): Promise<AttendanceRule>;

  getPromotionRules(): Promise<PromotionRule[]>;
  replacePromotionRules(rules: PromotionRule[]): Promise<PromotionRule[]>;
}
