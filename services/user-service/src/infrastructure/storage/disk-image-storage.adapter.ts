import { Injectable } from '@nestjs/common';
import { IImageStoragePort } from '../../application/ports/output/i-image-storage.port';
import { MulterMemoryFile, deletePhysicalFileByPublicUrl, saveImageToDisk } from './upload.util';

@Injectable()
export class DiskImageStorageAdapter implements IImageStoragePort {
  async save(subdir: string, file: MulterMemoryFile): Promise<{ publicUrl: string }> {
    const { publicUrl } = saveImageToDisk(subdir, file);
    return { publicUrl };
  }

  async deleteByPublicUrl(publicUrl: string | null): Promise<void> {
    deletePhysicalFileByPublicUrl(publicUrl);
  }
}
