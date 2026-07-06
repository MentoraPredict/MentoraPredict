import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { FormField } from "@/components/ui/FormField";

interface LoginPanelProps {
  apiBaseUrl: string;
  apiEnvironment: string;
  email: string;
  isSubmitting: boolean;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  password: string;
  serverError?: string | null;
}

export function LoginPanel({
  apiBaseUrl,
  apiEnvironment,
  email,
  isSubmitting,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  password,
  serverError,
}: LoginPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Bienvenido</Text>
      <Text style={styles.panelDescription}>Inicia sesion para continuar</Text>

      <View style={styles.form}>
        <FormField
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Correo institucional"
          onChangeText={onChangeEmail}
          placeholder="correo@mentorapredict.edu.ec"
          value={email}
        />

        <FormField
          autoCapitalize="none"
          label="Contrasena"
          onChangeText={onChangePassword}
          placeholder="********"
          secureTextEntry
          value={password}
        />

        {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

        <AppButton isLoading={isSubmitting} onPress={onSubmit}>
          Iniciar sesion
        </AppButton>

        <AppButton disabled variant="outline">
          Continuar con Microsoft proximamente
        </AppButton>

        <Text style={styles.apiHint}>
          Entorno {apiEnvironment.toUpperCase()} - {apiBaseUrl}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  panelTitle: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "800",
  },
  panelDescription: {
    color: "#64748B",
    fontSize: 15,
    marginTop: 4,
  },
  form: {
    marginTop: 18,
    gap: 14,
  },
  error: {
    color: "#B91C1C",
    fontSize: 13,
    lineHeight: 18,
  },
  apiHint: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
