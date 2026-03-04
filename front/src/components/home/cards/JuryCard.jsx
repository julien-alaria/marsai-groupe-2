export default function JuryCard({ image, membertitle, membersstitle }) {
  return (
    <div
      className="relative rounded-xl w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-80 lg:h-80 overflow-hidden border-2 border-[rgba(60, 158, 250, 0.2)] shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay permanent à 50% */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center hover:bg-[rgba(0,0,0,0.8)] px-2 z-20 ">
      <div className="justify-center items-center text-center z-30 absolute inset-0 flex flex-col opacity-0 hover:opacity-100">
         <h2 className="text-[#2B7FFF] font-bold text-2xl">{membertitle}</h2>
        <p className="text-white text-xl mt-1">{membersstitle}</p>
</div>
      </div>

    </div>
  );
}
