const presets = {
  primary: "badge badge-primary",
  secondary: "badge badge-secondary",
  accent: "badge badge-accent",
  info: "badge badge-info",
  success: "badge badge-success",
  warning: "badge badge-warning",
  error: "badge badge-error",
  ghost: "badge badge-ghost",
};

export default function Badge({ color = "primary", className = "", children, ...props }) {
  return (
    <span className={`${presets[color] || presets.primary} ${className}`} {...props}>
      {children}
    </span>
  );
}
