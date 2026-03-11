import { useMemo } from "react";
import { VideoPreview } from "./VideoPreview";

const styles = [
  {
    borderColor: "border-[rgba(194,122,255,0.90)]",
    hoverborderColor: "hover:border-[#C27AFF]",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(77,166,255,0.9)]",
    accentColor: "#C27AFF",
  },
  {
    borderColor: "border-[rgba(0,212,146,0.90)]",
    hoverborderColor: "hover:border-[#00D492]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(0,212,146,0.9)]",
    accentColor: "#00D492",
  },
  {
    borderColor: "border-[rgba(251,100,182,0.90)]",
    hoverborderColor: "hover:border-[#FB64B6]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(251,100,182,0.9)]",
    accentColor: "#FB64B6",
  },
  {
    borderColor: "border-[rgba(43,127,255,0.90)]",
    hoverborderColor: "hover:border-[#2B7FFF]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(43,127,255,0.9)]",
    accentColor: "#2B7FFF",
  },
];

export default function MoviesCard({
  videoSrc,
  poster,
  title,
  author,
  category,
  prize,
  sponsorLogo,
}) {

  const style = useMemo(() => {
    return styles[Math.floor(Math.random() * styles.length)];
  }, []);

  return (
    <div
      className={`
        w-150
        bg-[rgba(255,255,255,0.05)]
        rounded-[40px]
        border ${style.borderColor}
        flex flex-col
        overflow-hidden
        ${style.hoverborderColor}
        ${style.hoverShadow}
        transition
      `}
    >
      {/* VIDEO */}
      <div className="p-4 pb-0">
        <VideoPreview
          src={videoSrc}
          poster={poster}
          title={title}
        />
      </div>

      {/* CONTENT */}
      <div className="px-5 pt-4 pb-6 flex flex-col gap-4">

        <div className="flex justify-between items-start">
          <div>
            <h2
              className="text-lg font-bold uppercase"
              style={{ color: style.accentColor }}
            >
              {title}
            </h2>

            {author && (
              <p className="text-gray-400 text-sm">
                {author}
              </p>
            )}
          </div>

          {category && (
            <span className="text-xs text-gray-300 uppercase">
              {category}
            </span>
          )}
        </div>

        {(prize || sponsorLogo) && (
          <div className="flex items-center justify-between">

            {prize && (
              <p className="text-white text-sm font-semibold">
                {prize}
              </p>
            )}

            {sponsorLogo && (
              <img
                src={sponsorLogo}
                alt="Sponsor"
                className="h-8 object-contain"
              />
            )}

          </div>
        )}

      </div>
    </div>
  );
}