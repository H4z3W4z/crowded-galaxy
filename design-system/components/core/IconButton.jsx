import React from "react";
import { Icon } from "../icons/Icon.jsx";

/** Square icon-only button; always give a title/aria-label. */
export function IconButton({ name, variant = "secondary", size = "md", label, style, ...rest }) {
  const iconSize = size === "lg" ? 22 : size === "sm" ? 16 : 19;
  return (
    <button className={`cg-btn cg-iconbtn cg-btn--${variant} cg-btn--${size}`} title={label} aria-label={label} style={style} {...rest}>
      <Icon name={name} size={iconSize} />
    </button>
  );
}
