import { useMemo } from "react";

const styles = [
  {
    borderColor: "border-[rgba(194,122,255,0.90)]",
    hoverborderColor: "hover:border-[#C27AFF]",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(77,166,255,0.9)]",
  },
  {
    borderColor: "border-[rgba(0,212,146,0.90)]",
    hoverborderColor: "hover:border-[#00D492]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(0,212,146,0.9)]",
  },
  {
    borderColor: "border-[rgba(251,100,182,0.90)]",
    hoverborderColor: "hover:border-[#FB64B6]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(251,100,182,0.9)]",
  },
  {
    borderColor: "border-[rgba(43,127,255,0.90)]",
    hoverborderColor: "hover:border-[#2B7FFF]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(43,127,255,0.9)]",
  },
];

export default function OneCardWithImage({ image, title, url }) {
  const style = useMemo(() => {
    return styles[Math.floor(Math.random() * styles.length)];
  }, []);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
      <div
        className={`
          w-full h-50
          bg-[rgb(255,255,255)]
          rounded-[40px]
          border-4
          ${style.borderColor}
          flex flex-col
          overflow-hidden
          ${style.hoverborderColor}
          ${style.hoverShadow}
          transition
        `}
      >
        <div className="w-11/12 overflow-hidden mx-auto my-auto">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </a>
  );
}