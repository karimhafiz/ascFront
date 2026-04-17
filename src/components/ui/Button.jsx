import React from "react";
import { Link } from "react-router-dom";

const variants = {
  primary: "btn btn-primary",
  secondary: "btn btn-soft",
  ghost: "btn btn-ghost",
  danger: "btn btn-error btn-soft",
  circle: "btn btn-circle btn-primary",
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
