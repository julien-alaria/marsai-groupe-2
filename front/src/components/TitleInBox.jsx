export default function TitleInBox({
  icon = null,
  iconcolor,
  title,
  spancolor,
  title2,
}) {
    const spanStyle = spancolor ? { color: spancolor } : undefined;
    return (
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-[#C6CAD2]/30 to-[#0f1114]/10
        backdrop-blur-sm
        text-white rounded-full 
        px-4 py-2
        border border-white/30 mb-6 mt-6">
          {/* bg-gradient-to-br from-[#C6CAD2]/30 to-[#0f1114]/10
        backdrop-blur-sm
        text-white rounded-full 
        px-4 py-2
        border border-white/30 */}
        <span style={{ color: iconcolor }} className="pr-2 flex items-center">
  {icon}
</span>
            <div className="tracking-[0.25em] text-gray-300 font-bold uppercase">
              {title} {title2 ? <span style={spanStyle}>{title2}</span> : null}
            </div>
          </div>
    )
}
