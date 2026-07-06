import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  subtitle?: string;
  title: string;
}

interface MetricCardProps {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  value: string;
}

export function getRiskTone(riskLevel?: string | null): 'success' | 'warning' | 'danger' | 'default' {
  const normalized = riskLevel ?? 'UNKNOWN';
  if (normalized === 'HIGH' || normalized === 'CRITICAL') return 'danger';
  if (normalized === 'MEDIUM') return 'warning';
  if (normalized === 'LOW') return 'success';
  return 'default';
}

interface EmptyStateProps {
  message: string;
}

export function DashboardSection({ children, subtitle, title }: SectionProps) {
  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function MetricCard({ label, tone = 'default', value }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, toneStyles[tone]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function RiskBadge({ riskLevel }: { riskLevel?: string | null }) {
  const normalized = riskLevel ?? 'UNKNOWN';
  const label =
    normalized === 'HIGH' || normalized === 'CRITICAL'
      ? 'Alto'
      : normalized === 'MEDIUM'
        ? 'Medio'
        : normalized === 'LOW'
          ? 'Bajo'
          : 'Sin datos';
  const tone = normalized === 'HIGH' || normalized === 'CRITICAL'
    ? styles.riskHigh
    : normalized === 'MEDIUM'
      ? styles.riskMedium
      : normalized === 'LOW'
        ? styles.riskLow
        : styles.riskUnknown;

  return (
    <View style={[styles.riskBadge, tone]}>
      <Text style={styles.riskText}>Riesgo {label}</Text>
    </View>
  );
}

const toneStyles: Record<string, ViewStyle> = {
  default: { backgroundColor: '#F1F5F9' },
  success: { backgroundColor: '#DCFCE7' },
  warning: { backgroundColor: '#FEF3C7' },
  danger: { backgroundColor: '#FEE2E2' },
};

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  metricCard: {
    flex: 1,
    minWidth: 132,
    borderRadius: 16,
    padding: 14,
  },
  metricLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  emptyState: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  riskHigh: {
    backgroundColor: '#FEE2E2',
  },
  riskMedium: {
    backgroundColor: '#FEF3C7',
  },
  riskLow: {
    backgroundColor: '#DCFCE7',
  },
  riskUnknown: {
    backgroundColor: '#E2E8F0',
  },
  riskText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
});
