import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { tokens } from "../../styles/tokens";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onPress?: () => void;
};

const styles = StyleSheet.create({
  primary: {
    backgroundColor: tokens.colors.primary,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
  },
  secondary: {
    backgroundColor: tokens.colors.secondary,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
  },
  text: {
    color: tokens.colors.background,
    fontSize: 14,
    fontWeight: "600",
  },
});

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles[variant]} onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;
