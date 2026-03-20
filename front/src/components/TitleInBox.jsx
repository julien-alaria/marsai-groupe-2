export default function TitleInBox({
  icon = null,
  iconcolor,
  title,
  spancolor,
  title2,
}) {
    const spanStyle = spancolor ? { color: spancolor } : undefined;
    return (
         <div className="inline-flex items-center justify-center 
                          bg-black/40 border border-white/40 
                          px-4 py-1.5 rounded-full mb-6 mt-6">
                     <span style={{ color: iconcolor }} className="pr-2 flex items-center">
  {icon}
</span>
            <div className="tracking-[0.25em] text-gray-300 font-bold uppercase">
              {title} {title2 ? <span style={spanStyle}>{title2}</span> : null}
            </div>
          </div>
    )
}