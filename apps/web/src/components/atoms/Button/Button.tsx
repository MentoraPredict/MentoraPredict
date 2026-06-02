import React from "react";
import { buttonStyles } from "./Button.styles";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  ...rest
}) => {
  return (
    <button className={buttonStyles(variant)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
