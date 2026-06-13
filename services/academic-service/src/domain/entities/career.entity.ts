export class CareerEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public readonly facultyId: string,
    public durationSemesters: number,
  ) {}
}
