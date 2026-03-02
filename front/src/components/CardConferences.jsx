export default function ScheduleCard({
  time = "09:30",
  category = "SOCIAL",
  title = "Accueil & Café Networking",
  accentColor = "#4ade80",
  borderColor = "border-white/20",
  hoverShadow = "hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]",
  width = "w-full",
  height = "h-auto",
}) {
  return (
    <div
      className={`
        ${width}
        ${height}
        bg-[rgba(255,255,255,0.05)]
        rounded-2xl
        border ${borderColor}
        px-4 py-4 md:px-6 md:py-5
        flex
        items-start
        gap-4 md:gap-6
        transition
        ${hoverShadow}
      `}
    >

      {/* LEFT COLUMN — TIME */}
      <div
        className="text-lg md:text-2xl font-bold whitespace-nowrap"
        style={{ color: accentColor }}
      >
        {time}
      </div>

      {/* RIGHT COLUMN — CATEGORY + TITLE */}
      <div className="flex flex-col">
        <div
          className="text-lg md:text-2xl font-semibold tracking-wide uppercase"
          style={{ color: accentColor }}
        >
          {category}
        </div>

        <div className="text-white text-base md:text-lg font-semibold mt-1 leading-snug">
          {title}
        </div>
      </div>

    </div>
  );
}
