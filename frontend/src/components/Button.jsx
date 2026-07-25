export default function Button({ variant = "primary", size, children, ...rest }) {
  const variantClass = variant === "outline" ? "btn-outline" : "btn-gold";
  const sizeClass = size === "sm" ? "btn-sm" : "";
  return (
    <button className={`btn ${variantClass} ${sizeClass}`.trim()} {...rest}>
      {children}
    </button>
  );
}
