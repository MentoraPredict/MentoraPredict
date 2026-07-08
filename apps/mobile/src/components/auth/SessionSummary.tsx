import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import type { SessionUser } from '@/types/auth';

const ROLE_LABELS: Record<SessionUser['role'], string> = {
  ADMIN: 'Administrador',
  TEACHER: 'Docente',
  STUDENT: 'Estudiante',
};

function getDisplayName(user: SessionUser) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email;
}

interface SessionSummaryProps {
  onLogout: () => void;
  user: SessionUser;
}

export function SessionSummary({ onLogout, user }: SessionSummaryProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.sessionCard}>
        <Text style={styles.panelTitle}>Sesion iniciada</Text>
        <Text style={styles.userName}>{getDisplayName(user)}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>{ROLE_LABELS[user.role] ?? user.role}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estado</Text>
            <Text style={styles.infoValue}>{user.isActive === false ? 'Inactivo' : 'Activo'}</Text>
          </View>
        </View>

        <Text style={styles.userId}>ID: {user.id}</Text>

        <AppButton variant="outline" onPress={onLogout}>
          Cerrar sesion
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sessionCard: {
    gap: 12,
  },
  panelTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
  },
  userName: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    color: '#475569',
    fontSize: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#F1F5F9',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  userId: {
    color: '#64748B',
    fontSize: 12,
  },
});
