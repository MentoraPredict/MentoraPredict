import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

type ButtonVariant = 'primary' | 'outline';

interface AppButtonProps extends PressableProps {
  children: string;
  isLoading?: boolean;
  variant?: ButtonVariant;
}

export function AppButton({
  children,
  disabled,
  isLoading = false,
  variant = 'primary',
  ...props
}: AppButtonProps) {
  return (
    <Pressable
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        variant === 'outline' ? styles.outlineButton : styles.primaryButton,
        (pressed || disabled || isLoading) && styles.pressedButton,
      ]}
      {...props}>
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#1D4ED8' : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'outline' ? styles.outlineButtonText : styles.primaryButtonText,
          ]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pressedButton: {
    opacity: 0.78,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  outlineButtonText: {
    color: '#0F172A',
  },
});
