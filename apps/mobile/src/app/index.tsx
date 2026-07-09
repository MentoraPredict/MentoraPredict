import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { LoginPanel } from '@/components/auth/LoginPanel';
import { MobileAuthHero } from '@/components/auth/MobileAuthHero';
import { RoleWorkspace } from '@/components/dashboard/RoleWorkspace';
import { API_BASE_URL, login } from '@/services/auth';
import { API_ENV } from '@/services/api/client';
import { registerForPushNotifications, unregisterPushNotifications } from '@/services/notifications';
import type { AuthTokens, SessionUser } from '@/types/auth';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
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
      setTokens(session.tokens);
      setPassword('');

      // Best-effort: push notifications are a nice-to-have, never block login on this.
      registerForPushNotifications(session.tokens)
        .then(setPushToken)
        .catch(() => setPushToken(null));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'No se pudo iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    if (tokens && pushToken) {
      void unregisterPushNotifications(tokens, pushToken);
    }

    setUser(null);
    setTokens(null);
    setPushToken(null);
    setPassword('');
    setServerError(null);
  }

  if (user && tokens) {
    return <RoleWorkspace onLogout={handleLogout} tokens={tokens} user={user} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <MobileAuthHero />

        <LoginPanel
          apiBaseUrl={API_BASE_URL}
          apiEnvironment={API_ENV}
          email={email}
          isSubmitting={isSubmitting}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={handleLogin}
          password={password}
          serverError={serverError}
        />
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
