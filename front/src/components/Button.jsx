export default function Button({
  title,
  href = "#",
  size = "md",
  variant = "primary",
  onClick,
}) {
  const sizeClasses = {
    sm: "px-5 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  const variantClasses = {
    primary: `
      bg-white/15 backdrop-blur-md 
      border border-white/30 
      text-white 
      hover:bg-white/25 
      hover:border-white/50 
      shadow-[0_8px_32px_rgba(0,0,0,0.3)]
      hover:shadow-[0_8px_32px_rgba(173,70,255,0.4)]
    `,
    secondary: `
      bg-white/10 backdrop-blur-md 
      border border-white/25 
      text-white 
      hover:bg-white/20 
      hover:border-white/40
    `,
    gradient: `
      bg-gradient-to-r from-[#AD46FF] to-[#F6339A] 
      text-white 
      hover:shadow-[0_8px_32px_rgba(173,70,255,0.5)]
    `,
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-full font-semibold uppercase tracking-wider
    transition-all duration-300 ease-out
    ${sizeClasses[size]}
    ${variantClasses[variant]}
  `;

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {title}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {title}
    </button>
  );
}