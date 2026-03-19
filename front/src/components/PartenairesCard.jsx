const colors = [
  "#F6339A",
  "#4ECDC4",
  "#00A8E1",
  "#9B5DE5",
  "#F7B801"
];

let colorIndex = 0;

const UPLOAD_BASE =
  import.meta.env.VITE_UPLOAD_BASE || "http://localhost:3000/uploads";

export default function PartenaireCard({ name, logo, color, url }) {
  const finalColor = color || colors[colorIndex % colors.length];

  if (!color) {
    colorIndex++;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-200 w-80 p-4 rounded-[40px] transition-shadow"
      style={{ border: `2px solid ${finalColor}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 15px ${finalColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 transparent`;
      }}
    >
      <div className="w-full h-40 flex items-center justify-center mb-3">
        <img
          src={`${UPLOAD_BASE}${logo}`}
          alt={name}
          className="max-h-full object-contain"
        />
      </div>

      <h3 className="text-center font-semibold">{name}</h3>
    </a>
  );
}