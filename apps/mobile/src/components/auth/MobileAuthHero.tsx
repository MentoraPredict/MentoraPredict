import { StyleSheet, Text, View } from 'react-native';

export function MobileAuthHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>MP</Text>
      </View>
      <Text style={styles.eyebrow}>MentoraPredict</Text>
      <Text style={styles.title}>Prediccion de riesgo academico</Text>
      <Text style={styles.description}>
        Analiza patrones academicos, detecta alertas tempranas y acompana la toma de
        decisiones desde el aula.
      </Text>
      <View style={styles.secureBadge}>
        <Text style={styles.secureBadgeText}>Conexion segura</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#BFDBFE',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  description: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  secureBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#60A5FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  secureBadgeText: {
    color: '#DBEAFE',
    fontSize: 12,
    fontWeight: '700',
  },
});
