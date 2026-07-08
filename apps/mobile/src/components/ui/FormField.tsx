import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
  error?: string;
  label: string;
}

export function FormField({ error, label, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#94A3B8"
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: '#0F172A',
    fontSize: 15,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  error: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
  },
});
