const variants = {
  primary: "btn btn-primary",
  secondary: "btn btn-soft",
  ghost: "btn btn-ghost",
  danger: "btn btn-error btn-soft",
  circle: "btn btn-circle btn-primary",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button className={`${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
