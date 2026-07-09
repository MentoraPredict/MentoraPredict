import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { requestJson } from '@/services/api/client';
import type { AuthTokens } from '@/types/auth';

// Foreground presentation — without this, notifications only show up while
// the app is backgrounded/closed (the OS assumes a foregrounded app will
// handle "new data" itself).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

function toDevicePlatform(): 'ios' | 'android' | 'web' {
  return Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
}

/**
 * Requests notification permission, obtains an Expo push token, and
 * registers it with the backend for the authenticated user. Returns the
 * token so the caller can hold onto it for unregisterPushNotifications() on
 * logout — or null if push isn't available (simulator/emulator, permission
 * denied, or no EAS project configured).
 */
export async function registerForPushNotifications(tokens: AuthTokens): Promise<string | null> {
  if (!Device.isDevice) {
    return null; // Push tokens aren't issued to simulators/emulators.
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = getProjectId();
  if (!projectId) {
    return null;
  }

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

  await requestJson('/v1/notifications/device-tokens', {
    method: 'POST',
    tokens,
    body: JSON.stringify({ expoPushToken, platform: toDevicePlatform() }),
  });

  return expoPushToken;
}

/** Best-effort — the session is ending regardless of whether this succeeds. */
export async function unregisterPushNotifications(
  tokens: AuthTokens,
  expoPushToken: string,
): Promise<void> {
  try {
    await requestJson('/v1/notifications/device-tokens', {
      method: 'DELETE',
      tokens,
      body: JSON.stringify({ expoPushToken }),
    });
  } catch {
    // Ignore — nothing useful to do with a failed cleanup call on logout.
  }
}
