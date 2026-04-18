import React from "react";
import { Link } from "react-router-dom";

const variants = {
  primary:
    "btn border-0 bg-gradient-to-r from-primary to-primary/90 text-primary-content shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25",
  secondary:
    "btn border border-base-300 bg-white/90 text-base-content shadow-sm hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white hover:text-primary",
  ghost: "btn btn-ghost text-base-content/75 hover:bg-base-200/80 hover:text-base-content",
  danger:
    "btn border border-error/15 bg-error/10 text-error shadow-sm hover:-translate-y-0.5 hover:bg-error/15",
  circle:
    "btn btn-circle border-0 bg-gradient-to-r from-primary to-primary/90 text-primary-content shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25",
};

export default function Button({ variant = "primary", className = "", children, to, ...props }) {
  const classes = `${variants[variant] || variants.primary} ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
