import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IImageStoragePort } from '../../application/ports/output/i-image-storage.port';
import { DiskImageStorageAdapter } from './disk-image-storage.adapter';
import { SupabaseImageStorageAdapter } from './supabase-image-storage.adapter';

export type ImageStorageDriver = 'local' | 'supabase';

/**
 * Elige el adaptador del puerto de imágenes según IMAGE_STORAGE_DRIVER.
 *
 * - `local` (por defecto): guarda el archivo en la carpeta de subidas del
 *   servicio y en la base solo queda su ubicación pública.
 * - `supabase`: sube al bucket. La configuración SUPABASE_* se conserva y
 *   basta con cambiar el valor para volver a usarlo.
 */
export const imageStorageProvider = {
  provide: 'IImageStoragePort',
  inject: [ConfigService],
  useFactory: (config: ConfigService): IImageStoragePort => {
    const driver = config.get<string>('IMAGE_STORAGE_DRIVER', 'local').toLowerCase();
    const logger = new Logger('ImageStorage');

    if (driver === 'supabase') {
      logger.log('Image storage driver: supabase');
      return new SupabaseImageStorageAdapter(config);
    }

    if (driver !== 'local') {
      logger.warn(`IMAGE_STORAGE_DRIVER="${driver}" is not valid — using local disk.`);
    }
    logger.log('Image storage driver: local');
    return new DiskImageStorageAdapter();
  },
};