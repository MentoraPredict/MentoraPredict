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
  private readonly client: SupabaseClient | null;
  private readonly bucket: string;
  private readonly objectUrlPrefix: string;

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL', '');
    const serviceRoleKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY', '');
    this.bucket = config.get<string>('SUPABASE_STORAGE_BUCKET', 'mentorapredict-images');
    this.objectUrlPrefix = `${url}/storage/v1/object/public/${this.bucket}/`;

    if (!url || !serviceRoleKey) {
      // createClient() throws synchronously on an empty URL, and this
      // adapter is instantiated as part of Nest's DI graph — an unhandled
      // throw here would crash the whole service at boot, not just image
      // uploads. Defer the failure to save()/deleteByPublicUrl() instead.
      this.logger.warn(
        'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are not configured — image uploads will fail until they are set.',
      );
      this.client = null;
      return;
    }

    this.client = createClient(url, serviceRoleKey);
  }

  async save(subdir: string, file: MulterMemoryFile): Promise<{ publicUrl: string }> {
    if (!this.client) {
      throw new Error('Image storage is not configured (missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY).');
    }

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
    if (!this.client || !publicUrl?.startsWith(this.objectUrlPrefix)) return;

    const objectPath = publicUrl.slice(this.objectUrlPrefix.length);
    const { error } = await this.client.storage.from(this.bucket).remove([objectPath]);

    if (error) {
      // Never let a stale/already-deleted image block the caller's own update.
      this.logger.warn(`Supabase delete failed for ${objectPath}: ${error.message}`);
    }
  }
}
