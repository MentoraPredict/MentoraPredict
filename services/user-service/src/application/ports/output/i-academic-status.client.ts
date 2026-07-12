export interface DeactivationEligibility {
  canDeactivate: boolean;
  reason?: string;
}

export interface IAcademicStatusClient {
  getDeactivationEligibility(
    userId: string,
    role: string,
  ): Promise<DeactivationEligibility>;
}
