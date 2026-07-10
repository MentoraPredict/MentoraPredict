import { BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Disk local + volumen Docker (decidido en Prompt 0) — no S3/MinIO.
export const UPLOADS_ROOT = process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'uploads');
// Debe coincidir EXACTAMENTE con la ruta pública nueva agregada en Kong
// (kong-template.yml: user-uploads, strip_path: false, sin plugin jwt).
export const UPLOADS_URL_PREFIX = '/api/v1/users/uploads';

const IMAGE_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export interface MulterMemoryFile {
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export function validateImage(file: MulterMemoryFile | undefined): void {
  if (!file?.buffer) throw new BadRequestException('Se requiere un archivo');
  if (!IMAGE_MIME_EXT[file.mimetype]) {
    throw new UnsupportedMediaTypeException(
      `Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan jpg, jpeg o png.`,
    );
  }
  // file.size is the actual byte count multer parsed from the stream, not a
  // client-supplied header — this is a second, defense-in-depth check on
  // top of multer's own `limits.fileSize` (which rejects mid-stream).
  if (file.size > MAX_IMAGE_BYTES) {
    throw new PayloadTooLargeException('Archivo demasiado grande. Máximo 2MB para imágenes.');
  }
}

// Physical name is always server-generated (UUID + validated extension) —
// the client's original filename is never used for the path.
export function saveImageToDisk(subdir: string, file: MulterMemoryFile): { publicUrl: string; relativePath: string } {
  const ext = IMAGE_MIME_EXT[file.mimetype];
  const storedFileName = `${randomUUID()}.${ext}`;
  const dir = path.join(UPLOADS_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, storedFileName), file.buffer);

  const relativePath = path.posix.join(subdir, storedFileName);
  return { publicUrl: `${UPLOADS_URL_PREFIX}/${relativePath}`, relativePath };
}

// Accepts the PUBLIC url as stored in the DB and deletes the matching disk
// file, if any. Never trusts anything outside the known uploads root.
export function deletePhysicalFileByPublicUrl(publicUrl: string | null): void {
  if (!publicUrl?.startsWith(UPLOADS_URL_PREFIX)) return;
  const relativePath = publicUrl.slice(UPLOADS_URL_PREFIX.length + 1);
  const fullPath = path.join(UPLOADS_ROOT, relativePath);
  if (!fullPath.startsWith(UPLOADS_ROOT)) return; // guard against any traversal
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}
