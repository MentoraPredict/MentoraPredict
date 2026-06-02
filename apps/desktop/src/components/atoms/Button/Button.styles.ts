export const buttonStyles = (variant: "primary" | "secondary" = "primary") => {
  const base = "mp-btn";
  return `${base} ${base}--${variant}`;
};
