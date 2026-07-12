import { MulterMemoryFile } from '../../../infrastructure/storage/upload.util';

export interface IImageStoragePort {
  save(subdir: string, file: MulterMemoryFile): Promise<{ publicUrl: string }>;
  deleteByPublicUrl(publicUrl: string | null): Promise<void>;
}
