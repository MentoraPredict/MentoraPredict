export class TopicEntity {
  constructor(
    public readonly id: string,
    public readonly subjectId: string,
    public title: string,
    public description: string | null,
    public order: number,
    public fileUrl: string | null,
    public originalFileName: string | null,
    public fileSize: number | null,
    public mimeType: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  update(data: Partial<Pick<TopicEntity, 'title' | 'description' | 'order'>>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.order !== undefined) this.order = data.order;
    this.updatedAt = new Date();
  }

  setFile(meta: { fileUrl: string; originalFileName: string; fileSize: number; mimeType: string }): void {
    this.fileUrl = meta.fileUrl;
    this.originalFileName = meta.originalFileName;
    this.fileSize = meta.fileSize;
    this.mimeType = meta.mimeType;
    this.updatedAt = new Date();
  }

  clearFile(): void {
    this.fileUrl = null;
    this.originalFileName = null;
    this.fileSize = null;
    this.mimeType = null;
    this.updatedAt = new Date();
  }
}
