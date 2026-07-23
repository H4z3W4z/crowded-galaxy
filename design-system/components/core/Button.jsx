import React from "react";
import { Icon } from "../icons/Icon.jsx";

/** Chunky print-block button. */
export function Button({ variant = "primary", size = "md", icon, children, style, ...rest }) {
  const iconSize = size === "lg" ? 20 : size === "sm" ? 16 : 18;
  return (
    <button className={`cg-btn cg-btn--${variant} cg-btn--${size}`} style={style} {...rest}>
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
    </button>
  );
}
