export default function PartenaireCard({ name, logo, color, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-200 w-80 p-4 rounded-[40px] transition-shadow"
      style={{ border: `2px solid ${color}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 15px ${color}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 transparent`;
      }}
    >
      <div className="w-full h-40 flex items-center justify-center mb-3">
        {/* <img src={logo} alt={name} className="max-h-full object-contain" /> */}
        <img
            src={`http://localhost:3000${logo}`}
            alt={name}
            className="max-h-full object-contain"
/>
      </div>

      <h3 className="text-center font-semibold">{name}</h3>
    </a>
  );
}