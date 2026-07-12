import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/ports/i-user-profile.repository';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { IAuthSyncClient } from '../ports/output/i-auth-sync.client';
import { IAcademicStatusClient } from '../ports/output/i-academic-status.client';
import { INotificationClient } from '../ports/output/i-notification-client';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject('IUserProfileRepository') private readonly repo: IUserProfileRepository,
    @Inject('IAuthSyncClient') private readonly authSync: IAuthSyncClient,
    @Inject('IAcademicStatusClient') private readonly academicStatus: IAcademicStatusClient,
    @Inject('INotificationClient') private readonly notifications: INotificationClient,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserProfileEntity> {
    return this.executeWithOptions(id, dto);
  }

  async executeWithOptions(
    id: string,
    dto: UpdateUserDto,
    options: { skipAuthSync?: boolean } = {},
  ): Promise<UserProfileEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    // Always validate an INACTIVE request. The profile and auth databases are
    // separate and a previous failed synchronization may have left only one
    // side inactive.
    const isDeactivation = dto.status === 'INACTIVE';
    if (isDeactivation) {
      if (existing.role === 'ADMIN') {
        throw new ConflictException('No se puede desactivar a otro administrador.');
      }

      const eligibility = await this.academicStatus.getDeactivationEligibility(
        id,
        existing.role,
      );
      if (!eligibility.canDeactivate) {
        throw new ConflictException(
          eligibility.reason ?? 'El usuario tiene dependencias académicas activas.',
        );
      }
    }

    const isRoleChange = dto.role !== undefined && dto.role !== existing.role;
    if (isRoleChange && (existing.role === 'TEACHER' || existing.role === 'STUDENT')) {
      const eligibility = await this.academicStatus.getDeactivationEligibility(
        id,
        existing.role,
      );
      if (!eligibility.canDeactivate) {
        const reason = existing.role === 'TEACHER'
          ? 'No se puede cambiar el rol de docente a estudiante porque tiene al menos un curso activo asignado.'
          : 'No se puede cambiar el rol de estudiante a docente porque tiene al menos una matrícula activa en un curso activo.';
        throw new ConflictException(reason);
      }
    }

    const profilePatch: Partial<UserProfileEntity> = {
      photo: dto.photo,
      bio: dto.bio,
      cedula: dto.cedula,
      authProvider: dto.authProvider,
      role: dto.role,
      status: dto.status,
    };

    const updated = await this.repo.update(id, profilePatch);

    if (!options.skipAuthSync && (dto.email || dto.firstName || dto.lastName)) {
      await this.authSync.syncProfile(id, {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
    }

    if (dto.role !== undefined) {
      await this.authSync.syncRole(id, dto.role);
      if (isRoleChange && (dto.role === 'TEACHER' || dto.role === 'STUDENT')) {
        await this.notifications.notify({
          recipientId: id,
          recipientRole: dto.role,
          type: 'ROLE_CHANGED',
          title: 'Tu rol ha cambiado',
          message: dto.role === 'TEACHER'
            ? 'Un administrador cambió tu rol de estudiante a docente. Ya puedes acceder a las funciones para docentes.'
            : 'Un administrador cambió tu rol de docente a estudiante. Ya puedes acceder a las funciones para estudiantes.',
        });
      }
    }
    if (dto.status !== undefined) {
      // Wait for auth-service so the following admin reload cannot observe the
      // old login status immediately after a successful update.
      await this.authSync.syncStatus(id, dto.status);
    }

    return updated;
  }
}
