import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { IImageStoragePort } from '../../application/ports/output/i-image-storage.port';
import { MulterMemoryFile } from './upload.util';

const IMAGE_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

@Injectable()
export class SupabaseImageStorageAdapter implements IImageStoragePort {
  private readonly logger = new Logger(SupabaseImageStorageAdapter.name);
  private readonly client: SupabaseClient;
  private readonly bucket: string;
  private readonly objectUrlPrefix: string;

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL', '');
    const serviceRoleKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY', '');
    this.bucket = config.get<string>('SUPABASE_STORAGE_BUCKET', 'mentorapredict-images');
    this.client = createClient(url, serviceRoleKey);
    this.objectUrlPrefix = `${url}/storage/v1/object/public/${this.bucket}/`;
  }

  async save(subdir: string, file: MulterMemoryFile): Promise<{ publicUrl: string }> {
    const ext = IMAGE_MIME_EXT[file.mimetype] ?? 'jpg';
    const objectPath = `${subdir}/${randomUUID()}.${ext}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(objectPath, file.buffer, { contentType: file.mimetype, upsert: false });

    if (error) {
      this.logger.error(`Supabase upload failed for ${objectPath}: ${error.message}`);
      throw error;
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(objectPath);
    return { publicUrl: data.publicUrl };
  }

  async deleteByPublicUrl(publicUrl: string | null): Promise<void> {
    if (!publicUrl?.startsWith(this.objectUrlPrefix)) return;

    const objectPath = publicUrl.slice(this.objectUrlPrefix.length);
    const { error } = await this.client.storage.from(this.bucket).remove([objectPath]);

    if (error) {
      // Never let a stale/already-deleted image block the caller's own update.
      this.logger.warn(`Supabase delete failed for ${objectPath}: ${error.message}`);
    }
  }
}
