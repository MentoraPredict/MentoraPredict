import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { LoginPanel } from '@/components/auth/LoginPanel';
import { MobileAuthHero } from '@/components/auth/MobileAuthHero';
import { SessionSummary } from '@/components/auth/SessionSummary';
import { API_BASE_URL, login } from '@/services/auth';
import type { SessionUser } from '@/types/auth';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setServerError(null);

    if (!email.trim() || !password) {
      setServerError('Ingresa tu correo y contrasena.');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login({
        email: email.trim(),
        password,
      });

      setUser(session.user);
      setPassword('');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'No se pudo iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setPassword('');
    setServerError(null);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <MobileAuthHero />

        {user ? (
          <SessionSummary onLogout={handleLogout} user={user} />
        ) : (
          <LoginPanel
            apiBaseUrl={API_BASE_URL}
            email={email}
            isSubmitting={isSubmitting}
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
            onSubmit={handleLogin}
            password={password}
            serverError={serverError}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 20,
  },
});
