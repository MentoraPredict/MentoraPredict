import { Image, StyleSheet, Text, View } from "react-native";

export function MobileAuthHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.brandRow}>
        <Image
          accessibilityLabel="Logo de MentoraPredict"
          source={require("../../../../../assets/mentorapredict-banner.jpg")}
          style={styles.logo}
        />
        <View>
          <Text style={styles.brandName}>MentoraPredict</Text>
          <Text style={styles.brandSubtitle}>Academic Strategy</Text>
        </View>
      </View>
      <Text style={styles.title}>Aula inteligente</Text>

      <View style={styles.secureBadge}>
        <Text style={styles.secureBadgeText}>Conexion segura</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#0B1220",
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  brandSubtitle: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "700",
  },
  eyebrow: {
    color: "#BFDBFE",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
  },
  description: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
  },
  secureBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#60A5FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  secureBadgeText: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "700",
  },
});
