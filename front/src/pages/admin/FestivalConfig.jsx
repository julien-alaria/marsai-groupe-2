// import { useRef, useState } from "react";
// import { useFestivalConfig } from "../../hooks/useFestivalConfig";
// import SectionCard from "../../components/admin/config/SectionCard";
// import ConfigInput from "../../components/admin/config/ConfigInput";
// import ColorPicker from "../../components/admin/config/ColorPicker";

// // ─── Icon helpers ──────────────────────────────────────────────────────────────
// const Icon = ({ d, size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
//     <path d={d} />
//   </svg>
// );

// const ICONS = {
//   general:     "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
//   hero:        "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
//   goals:       "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
//   program:     "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
//   party:       "M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-1.5-.454M9 6l3 3m0 0l3-3m-3 3V3",
//   location:    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
//   stats:       "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
//   eye:         "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
//   navbar:      "M4 6h16M4 12h16M4 18h16",
//   footer:      "M4 16h16M4 12h10",
//   sponsors:    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
// };

// // ─── Tiny toggle for navbar links ─────────────────────────────────────────────
// function NavbarToggle({ label, value, onChange }) {
//   return (
//     <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
//       <span className="text-sm text-white/70">{label}</span>
//       <button
//         type="button"
//         onClick={() => onChange(!value)}
//         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//           value ? "bg-violet-600" : "bg-white/10"
//         }`}
//       >
//         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
//       </button>
//     </div>
//   );
// }

// // ─── Save toast ───────────────────────────────────────────────────────────────
// function Toast({ msg }) {
//   if (!msg) return null;
//   return (
//     <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-violet-600 text-white text-sm font-medium shadow-lg shadow-violet-900/40 animate-bounce">
//       {msg}
//     </div>
//   );
// }

// // ─── Main component ───────────────────────────────────────────────────────────
// export default function FestivalConfig() {
//   const { config, loading, updateConfig, resetConfig, exportConfig, importConfig } =
//     useFestivalConfig();

//   const [toast, setToast] = useState("");
//   const importRef = useRef();

//   if (loading || !config) {
//     return (
//       <div className="flex items-center justify-center h-64 text-white/40">
//         Chargement de la configuration…
//       </div>
//     );
//   }

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(""), 2500);
//   };

//   const section = (key) => config[key] || {};
//   const update = (key) => (field) => (val) => updateConfig(key, { [field]: val });
//   const toggle = (key) => () => updateConfig(key, { visible: !section(key).visible });

//   // ── Import handler
//   const handleImport = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const ok = importConfig(ev.target.result);
//       showToast(ok ? "✓ Configuration importée" : "✗ Fichier invalide");
//     };
//     reader.readAsText(file);
//     e.target.value = "";
//   };

//   return (
//     <div className="min-h-screen bg-[#080a0d] text-white">
//       <Toast msg={toast} />

//       {/* ── Page header */}
//       <div className="px-8 pt-8 pb-6 border-b border-white/5">
//         <h1 className="text-2xl font-bold text-white">Configuration Festival</h1>
//         <p className="text-sm text-white/40 mt-1">
//           Gérez le contenu et la visibilité de chaque section du site public.
//         </p>
//       </div>

//       <div className="px-8 py-6 max-w-4xl">

//         {/* ── Informations Générales */}
//         <SectionCard icon={<Icon d={ICONS.general} />} title="Informations Générales" defaultOpen>
//           <div className="grid grid-cols-2 gap-4">
//             <ConfigInput
//               label="Nom du festival"
//               value={section("general").festivalName}
//               onChange={update("general")("festivalName")}
//               placeholder="MARS AI"
//             />
//             <ConfigInput
//               label="Édition"
//               value={section("general").edition}
//               onChange={update("general")("edition")}
//               placeholder="2026"
//             />
//           </div>
//           <div className="pt-2">
//             <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Couleurs</p>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <ColorPicker label="Primaire" value={section("general").colors?.primary} onChange={(v) => updateConfig("general", { colors: { ...section("general").colors, primary: v } })} />
//               <ColorPicker label="Accent" value={section("general").colors?.accent} onChange={(v) => updateConfig("general", { colors: { ...section("general").colors, accent: v } })} />
//               <ColorPicker label="Fond" value={section("general").colors?.background} onChange={(v) => updateConfig("general", { colors: { ...section("general").colors, background: v } })} />
//               <ColorPicker label="Texte" value={section("general").colors?.text} onChange={(v) => updateConfig("general", { colors: { ...section("general").colors, text: v } })} />
//             </div>
//           </div>
//         </SectionCard>

//         {/* ── Hero */}
//         <SectionCard icon={<Icon d={ICONS.hero} />} title="Section Hero" visible={section("hero").visible} onToggleVisible={toggle("hero")}>
//           <div className="grid grid-cols-2 gap-4">
//             <ConfigInput label="Badge" value={section("hero").badge} onChange={update("hero")("badge")} placeholder="Festival International" />
//             <ConfigInput label="Image de fond (URL)" value={section("hero").backgroundImage} onChange={update("hero")("backgroundImage")} placeholder="https://..." />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <ConfigInput label="Titre principal" value={section("hero").titleMain} onChange={update("hero")("titleMain")} placeholder="MARS" />
//             <ConfigInput label="Titre accent" value={section("hero").titleAccent} onChange={update("hero")("titleAccent")} placeholder="AI" />
//           </div>
//           <ConfigInput label="Description" value={section("hero").description} onChange={update("hero")("description")} multiline placeholder="Description du festival…" />
//         </SectionCard>

//         {/* ── Reassure */}
//         <SectionCard icon={<Icon d={ICONS.eye} />} title="Section Reassure" visible={section("reassure").visible} onToggleVisible={toggle("reassure")}>
//           <p className="text-sm text-white/40 italic">Aucun champ texte configurable pour cette section (Phase 1).</p>
//         </SectionCard>

//         {/* ── Goals */}
//         <SectionCard icon={<Icon d={ICONS.goals} />} title='Section Objectifs ("Goals")' visible={section("goals").visible} onToggleVisible={toggle("goals")}>
//           <div className="grid grid-cols-2 gap-4">
//             <ConfigInput label="Titre principal" value={section("goals").titleMain} onChange={update("goals")("titleMain")} placeholder="Nos" />
//             <ConfigInput label="Titre accent" value={section("goals").titleAccent} onChange={update("goals")("titleAccent")} placeholder="Objectifs" />
//           </div>
//         </SectionCard>

//         {/* ── Protocole */}
//         <SectionCard icon={<Icon d={ICONS.goals} />} title="Section Protocole" visible={section("protocole").visible} onToggleVisible={toggle("protocole")}>
//           <div className="grid grid-cols-2 gap-4">
//             <ConfigInput label="Titre principal" value={section("protocole").titleMain} onChange={update("protocole")("titleMain")} placeholder="Le" />
//             <ConfigInput label="Titre accent" value={section("protocole").titleAccent} onChange={update("protocole")("titleAccent")} placeholder="Protocole" />
//           </div>
//         </SectionCard>

//         {/* ── Program */}
//         <SectionCard icon={<Icon d={ICONS.program} />} title="Section Programme" visible={section("program").visible} onToggleVisible={toggle("program")}>
//           <div className="grid grid-cols-3 gap-4">
//             <ConfigInput label="Titre principal" value={section("program").titleMain} onChange={update("program")("titleMain")} placeholder="Le" />
//             <ConfigInput label="Titre accent" value={section("program").titleAccent} onChange={update("program")("titleAccent")} placeholder="Programme" />
//             <ConfigInput label="Badge" value={section("program").badge} onChange={update("program")("badge")} placeholder="Édition 2026" />
//           </div>
//         </SectionCard>

//         {/* ── Party */}
//         <SectionCard icon={<Icon d={ICONS.party} />} title='Section Soirée ("Party")' visible={section("party").visible} onToggleVisible={toggle("party")}>
//           <div className="grid grid-cols-2 gap-4">
//             <ConfigInput label="Titre" value={section("party").title} onChange={update("party")("title")} placeholder="La Soirée de Gala" />
//             <ConfigInput label="Date" value={section("party").date} onChange={update("party")("date")} placeholder="15 Mars 2026" />
//           </div>
//           <ConfigInput label="Description" value={section("party").description} onChange={update("party")("description")} multiline placeholder="Description de la soirée…" />
//         </SectionCard>

//         {/* ── Promoters */}
//         <SectionCard icon={<Icon d={ICONS.eye} />} title="Section Promoteurs" visible={section("promoters").visible} onToggleVisible={toggle("promoters")}>
//           <p className="text-sm text-white/40 italic">Aucun champ texte configurable pour cette section (Phase 1).</p>
//         </SectionCard>

//         {/* ── Localisation */}
//         <SectionCard icon={<Icon d={ICONS.location} />} title='Section Lieu ("Localisation")' visible={section("localisation").visible} onToggleVisible={toggle("localisation")}>
//           <div className="grid grid-cols-2 gap-4">
//             <ConfigInput label="Titre principal" value={section("localisation").titleMain} onChange={update("localisation")("titleMain")} placeholder="Le" />
//             <ConfigInput label="Titre accent" value={section("localisation").titleAccent} onChange={update("localisation")("titleAccent")} placeholder="Lieu" />
//           </div>
//           <ConfigInput label="Sous-titre" value={section("localisation").subtitle} onChange={update("localisation")("subtitle")} placeholder="Au cœur de Marseille" />
//           <ConfigInput label="Description" value={section("localisation").description} onChange={update("localisation")("description")} multiline placeholder="Description du lieu…" />
//           <ConfigInput label="URL Google Maps (embed)" value={section("localisation").mapUrl} onChange={update("localisation")("mapUrl")} placeholder="https://www.google.com/maps/embed?..." />
//         </SectionCard>

//         {/* ── Statistics */}
//         <SectionCard icon={<Icon d={ICONS.stats} />} title="Section Statistiques" visible={section("statistics").visible} onToggleVisible={toggle("statistics")}>
//           <div className="grid grid-cols-2 gap-4">
//             <ConfigInput label="Titre principal" value={section("statistics").titleMain} onChange={update("statistics")("titleMain")} placeholder="Les" />
//             <ConfigInput label="Titre accent" value={section("statistics").titleAccent} onChange={update("statistics")("titleAccent")} placeholder="Chiffres" />
//           </div>
//         </SectionCard>

//         {/* ── Sponsors */}
//         <SectionCard icon={<Icon d={ICONS.sponsors} />} title="Section Sponsors" visible={section("sponsors").visible} onToggleVisible={toggle("sponsors")}>
//           <p className="text-sm text-white/40 italic">Aucun champ texte configurable pour cette section (Phase 1).</p>
//         </SectionCard>

//         {/* ── Footer */}
//         <SectionCard icon={<Icon d={ICONS.footer} />} title="Footer" visible={section("footer").visible} onToggleVisible={toggle("footer")}>
//           <ConfigInput label="Description du footer" value={section("footer").description} onChange={update("footer")("description")} multiline placeholder="Description du festival…" />
//         </SectionCard>

//         {/* ── Navbar */}
//         <SectionCard icon={<Icon d={ICONS.navbar} />} title="Navbar — Liens visibles">
//           <NavbarToggle label="Jury" value={section("navbar").showJury} onChange={(v) => updateConfig("navbar", { showJury: v })} />
//           <NavbarToggle label="Programme" value={section("navbar").showProgram} onChange={(v) => updateConfig("navbar", { showProgram: v })} />
//           <NavbarToggle label="Sponsors" value={section("navbar").showSponsors} onChange={(v) => updateConfig("navbar", { showSponsors: v })} />
//           <NavbarToggle label="Informations" value={section("navbar").showInfos} onChange={(v) => updateConfig("navbar", { showInfos: v })} />
//         </SectionCard>

//         {/* ── Actions */}
//         <div className="mt-8 flex flex-wrap items-center gap-3 pb-16">
//           <button
//             type="button"
//             onClick={() => { exportConfig(); showToast("✓ Configuration exportée"); }}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
//           >
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
//             Exporter JSON
//           </button>

//           <button
//             type="button"
//             onClick={() => importRef.current?.click()}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium transition-colors"
//           >
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" /></svg>
//             Importer JSON
//           </button>
//           <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

//           <button
//             type="button"
//             onClick={async () => { await resetConfig(); showToast("✓ Configuration réinitialisée"); }}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-sm font-medium transition-colors ml-auto"
//           >
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
//             Réinitialiser
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }





import { useEffect, useRef, useState } from "react";
import { sponsorService } from "../../api/adminSponsors";
import { useFestivalConfig } from "../../hooks/useFestivalConfig";
import SectionCard from "../../components/admin/config/SectionCard";
import ConfigInput from "../../components/admin/config/ConfigInput";
import ColorPicker from "../../components/admin/config/ColorPicker";
import { UPLOAD_BASE } from "../../utils/constants";

// ─── Icon helpers ──────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  general:     "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  hero:        "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  goals:       "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  program:     "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  party:       "M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-1.5-.454M9 6l3 3m0 0l3-3m-3 3V3",
  location:    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  stats:       "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  eye:         "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  navbar:      "M4 6h16M4 12h16M4 18h16",
  footer:      "M4 16h16M4 12h10",
  sponsors:    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

// ─── Tiny toggle for navbar links ─────────────────────────────────────────────
function NavbarToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/70">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-violet-600" : "bg-white/10"
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

// ─── Save toast ───────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-violet-600 text-white text-sm font-medium shadow-lg shadow-violet-900/40 animate-bounce">
      {msg}
    </div>
  );
}


// ─── Sponsors Manager (embedded in FestivalConfig) ────────────────────────────
const CATEGORIES = [
  { value: "officiels",   label: "Officiels"   },
  { value: "medias",      label: "Médias"       },
  { value: "techniques",  label: "Techniques"  },
  { value: "divers",      label: "Divers"       },
];

function SponsorsManager() {
  const { getSponsors, createSponsor, updateSponsor, deleteSponsor } = sponsorService();

  const [sponsors,   setSponsors]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [notice,     setNotice]     = useState(null);   // { msg, ok }
  const [editId,     setEditId]     = useState(null);   // null = add mode
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ name: "", category: "officiels", url: "", logo: null });
  const [preview,    setPreview]    = useState(null);
  const logoRef = useRef();

  const flash = (msg, ok = true) => {
    setNotice({ msg, ok });
    setTimeout(() => setNotice(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const r = await getSponsors();
      setSponsors(r.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setForm({ name: "", category: "officiels", url: "", logo: null });
    setPreview(null);
    setEditId(null);
    setShowForm(false);
    if (logoRef.current) logoRef.current.value = "";
  };

  const startEdit = (sp) => {
    setForm({ name: sp.name, category: sp.category || "divers", url: sp.url || "", logo: null });
    setPreview(`${UPLOAD_BASE}${sp.logo}`);
    setEditId(sp.id_sponsor);
    setShowForm(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, logo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return flash("Le nom est obligatoire.", false);
    if (!editId && !form.logo) return flash("Le logo est obligatoire.", false);

    const fd = new FormData();
    fd.append("name",     form.name.trim());
    fd.append("category", form.category);
    fd.append("url",      form.url.trim());
    if (form.logo) fd.append("logo", form.logo);

    try {
      if (editId) {
        await updateSponsor(editId, fd);
        flash("✓ Sponsor mis à jour.");
      } else {
        await createSponsor(fd);
        flash("✓ Sponsor ajouté.");
      }
      resetForm();
      fetchAll();
    } catch (err) {
      flash(err?.response?.data?.error || "Erreur lors de la sauvegarde.", false);
    }
  };

  const handleDelete = async (sp) => {
    if (!window.confirm(`Supprimer "${sp.name}" définitivement ?`)) return;
    try {
      await deleteSponsor(sp.id_sponsor);
      flash("Sponsor supprimé.");
      fetchAll();
    } catch {
      flash("Erreur lors de la suppression.", false);
    }
  };

  const byCat = CATEGORIES.map((c) => ({
    ...c,
    items: sponsors.filter((s) => s.category === c.value),
  })).filter((c) => c.items.length > 0 || showForm);

  return (
    <div className="space-y-5">

      {/* Notice */}
      {notice && (
        <div className={`px-4 py-2.5 rounded-xl text-sm border ${
          notice.ok
            ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-300"
            : "bg-red-500/15 border-red-500/25 text-red-300"
        }`}>{notice.msg}</div>
      )}

      {/* Bouton ouvrir formulaire */}
      {!showForm && (
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/25 text-violet-300 text-sm font-medium transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un sponsor
        </button>
      )}

      {/* Formulaire add / edit */}
      {showForm && (
        <div className="bg-white/4 border border-white/10 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-white/70">
            {editId ? "Modifier le sponsor" : "Nouveau sponsor"}
          </p>

          {/* Preview logo */}
          {preview && (
            <div className="w-24 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
              <img src={preview} alt="preview" className="max-h-full max-w-full object-contain p-1" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Nom */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Nom *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Acme Corp"
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-violet-500/40 placeholder:text-white/15"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Catégorie *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-[#1a1c22] border border-white/10 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-violet-500/40"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* URL */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">URL du site</label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://exemple.com"
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-violet-500/40 placeholder:text-white/15"
              />
            </div>

            {/* Logo */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                Logo {editId ? "(laisser vide pour garder l'actuel)" : "*"}
              </label>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full text-xs text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-violet-600/20 file:text-violet-300 hover:file:bg-violet-600/30 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              {editId ? "Mettre à jour" : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white/50 text-sm transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste par catégorie */}
      {loading ? (
        <p className="text-xs text-white/30 italic">Chargement…</p>
      ) : sponsors.length === 0 ? (
        <p className="text-xs text-white/30 italic">Aucun sponsor enregistré.</p>
      ) : (
        <div className="space-y-5">
          {CATEGORIES.map((cat) => {
            const items = sponsors.filter((s) => s.category === cat.value);
            if (!items.length) return null;
            return (
              <div key={cat.value}>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/25 font-semibold mb-2.5">{cat.label}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((sp) => (
                    <div key={sp.id_sponsor}
                      className="group relative flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-3 hover:border-white/15 transition-all duration-200"
                    >
                      <div className="w-12 h-10 flex-shrink-0 bg-white/8 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={`${UPLOAD_BASE}${sp.logo}`}
                          alt={sp.name}
                          className="max-h-full max-w-full object-contain p-1"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{sp.name}</p>
                        {sp.url && (
                          <a href={sp.url} target="_blank" rel="noreferrer"
                            className="text-[10px] text-violet-400/60 hover:text-violet-300 truncate block transition-colors">
                            {sp.url.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </div>
                      {/* Actions hover */}
                      <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(sp)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-violet-500/30 text-white/50 hover:text-violet-300 transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sp)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/30 text-white/50 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FestivalConfig() {
  const { config, loading, updateConfig, resetConfig, exportConfig, importConfig } =
    useFestivalConfig();

  const [toast, setToast] = useState("");
  const importRef = useRef();

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40">
        Chargement de la configuration…
      </div>
    );
  }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const section = (key) => config[key] || {};
  const update = (key) => (field) => (val) => updateConfig(key, { [field]: val });
  const toggle = (key) => () => updateConfig(key, { visible: !section(key).visible });

  // ── Import handler
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importConfig(ev.target.result);
      showToast(ok ? "✓ Configuration importée" : "✗ Fichier invalide");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-[#080a0d] text-white">
      <Toast msg={toast} />

      {/* ── Page header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">Configuration Festival</h1>
        <p className="text-sm text-white/40 mt-1">
          Gérez le contenu et la visibilité de chaque section du site public.
        </p>
      </div>

      <div className="px-8 py-6 max-w-4xl">

        {/* ── Informations Générales */}
        <SectionCard icon={<Icon d={ICONS.general} />} title="Informations Générales">
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput
              label="Nom du festival"
              value={section("general").festivalName}
              onChange={update("general")("festivalName")}
              placeholder="MARS AI"
            />
            <ConfigInput
              label="Édition"
              value={section("general").edition}
              onChange={update("general")("edition")}
              placeholder="2026"
            />
          </div>
          <div className="pt-2">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Couleurs</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorPicker label="Primaire" value={section("general").colors?.primary} onChange={(v) => updateConfig("general", { colors: { ...section("general").colors, primary: v } })} />
              <ColorPicker label="Accent" value={section("general").colors?.accent} onChange={(v) => updateConfig("general", { colors: { ...section("general").colors, accent: v } })} />
              <ColorPicker label="Fond" value={section("general").colors?.background} onChange={(v) => updateConfig("general", { colors: { ...section("general").colors, background: v } })} />
              <ColorPicker label="Texte" value={section("general").colors?.text} onChange={(v) => updateConfig("general", { colors: { ...section("general").colors, text: v } })} />
            </div>
          </div>
        </SectionCard>

        {/* ── Hero */}
        <SectionCard icon={<Icon d={ICONS.hero} />} title="Section Hero" visible={section("hero").visible} onToggleVisible={toggle("hero")}>
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput label="Badge" value={section("hero").badge} onChange={update("hero")("badge")} placeholder="Festival International" />
            <ConfigInput label="Image de fond (URL)" value={section("hero").backgroundImage} onChange={update("hero")("backgroundImage")} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput label="Titre principal" value={section("hero").titleMain} onChange={update("hero")("titleMain")} placeholder="MARS" />
            <ConfigInput label="Titre accent" value={section("hero").titleAccent} onChange={update("hero")("titleAccent")} placeholder="AI" />
          </div>
          <ConfigInput label="Description" value={section("hero").description} onChange={update("hero")("description")} multiline placeholder="Description du festival…" />
        </SectionCard>

        {/* ── Reassure */}
        <SectionCard icon={<Icon d={ICONS.eye} />} title="Section Reassure" visible={section("reassure").visible} onToggleVisible={toggle("reassure")}>
          <p className="text-sm text-white/40 italic">Aucun champ texte configurable pour cette section (Phase 1).</p>
        </SectionCard>

        {/* ── Goals */}
        <SectionCard icon={<Icon d={ICONS.goals} />} title='Section Objectifs ("Goals")' visible={section("goals").visible} onToggleVisible={toggle("goals")}>
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput label="Titre principal" value={section("goals").titleMain} onChange={update("goals")("titleMain")} placeholder="Nos" />
            <ConfigInput label="Titre accent" value={section("goals").titleAccent} onChange={update("goals")("titleAccent")} placeholder="Objectifs" />
          </div>
        </SectionCard>

        {/* ── Protocole */}
        <SectionCard icon={<Icon d={ICONS.goals} />} title="Section Protocole" visible={section("protocole").visible} onToggleVisible={toggle("protocole")}>
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput label="Titre principal" value={section("protocole").titleMain} onChange={update("protocole")("titleMain")} placeholder="Le" />
            <ConfigInput label="Titre accent" value={section("protocole").titleAccent} onChange={update("protocole")("titleAccent")} placeholder="Protocole" />
          </div>
        </SectionCard>

        {/* ── Program */}
        <SectionCard icon={<Icon d={ICONS.program} />} title="Section Programme" visible={section("program").visible} onToggleVisible={toggle("program")}>
          <div className="grid grid-cols-3 gap-4">
            <ConfigInput label="Titre principal" value={section("program").titleMain} onChange={update("program")("titleMain")} placeholder="Le" />
            <ConfigInput label="Titre accent" value={section("program").titleAccent} onChange={update("program")("titleAccent")} placeholder="Programme" />
            <ConfigInput label="Badge" value={section("program").badge} onChange={update("program")("badge")} placeholder="Édition 2026" />
          </div>
        </SectionCard>

        {/* ── Party */}
        <SectionCard icon={<Icon d={ICONS.party} />} title='Section Soirée ("Party")' visible={section("party").visible} onToggleVisible={toggle("party")}>
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput label="Titre" value={section("party").title} onChange={update("party")("title")} placeholder="La Soirée de Gala" />
            <ConfigInput label="Date" value={section("party").date} onChange={update("party")("date")} placeholder="15 Mars 2026" />
          </div>
          <ConfigInput label="Description" value={section("party").description} onChange={update("party")("description")} multiline placeholder="Description de la soirée…" />
        </SectionCard>

        {/* ── Promoters */}
        <SectionCard icon={<Icon d={ICONS.eye} />} title="Section Promoteurs" visible={section("promoters").visible} onToggleVisible={toggle("promoters")}>
          <p className="text-sm text-white/40 italic">Aucun champ texte configurable pour cette section (Phase 1).</p>
        </SectionCard>

        {/* ── Localisation */}
        <SectionCard icon={<Icon d={ICONS.location} />} title='Section Lieu ("Localisation")' visible={section("localisation").visible} onToggleVisible={toggle("localisation")}>
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput label="Titre principal" value={section("localisation").titleMain} onChange={update("localisation")("titleMain")} placeholder="Le" />
            <ConfigInput label="Titre accent" value={section("localisation").titleAccent} onChange={update("localisation")("titleAccent")} placeholder="Lieu" />
          </div>
          <ConfigInput label="Sous-titre" value={section("localisation").subtitle} onChange={update("localisation")("subtitle")} placeholder="Au cœur de Marseille" />
          <ConfigInput label="Description" value={section("localisation").description} onChange={update("localisation")("description")} multiline placeholder="Description du lieu…" />
          <ConfigInput label="URL Google Maps (embed)" value={section("localisation").mapUrl} onChange={update("localisation")("mapUrl")} placeholder="https://www.google.com/maps/embed?..." />
        </SectionCard>

        {/* ── Statistics */}
        <SectionCard icon={<Icon d={ICONS.stats} />} title="Section Statistiques" visible={section("statistics").visible} onToggleVisible={toggle("statistics")}>
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput label="Titre principal" value={section("statistics").titleMain} onChange={update("statistics")("titleMain")} placeholder="Les" />
            <ConfigInput label="Titre accent" value={section("statistics").titleAccent} onChange={update("statistics")("titleAccent")} placeholder="Chiffres" />
          </div>
        </SectionCard>

        {/* ── Sponsors */}
        <SectionCard icon={<Icon d={ICONS.sponsors} />} title="Section Sponsors" visible={section("sponsors").visible} onToggleVisible={toggle("sponsors")}>
          <SponsorsManager />
        </SectionCard>

        {/* ── Footer */}
        <SectionCard icon={<Icon d={ICONS.footer} />} title="Footer" visible={section("footer").visible} onToggleVisible={toggle("footer")}>
          <ConfigInput label="Description du footer" value={section("footer").description} onChange={update("footer")("description")} multiline placeholder="Description du festival…" />
        </SectionCard>

        {/* ── Navbar */}
        <SectionCard icon={<Icon d={ICONS.navbar} />} title="Navbar — Liens visibles">
          <NavbarToggle label="Jury" value={section("navbar").showJury} onChange={(v) => updateConfig("navbar", { showJury: v })} />
          <NavbarToggle label="Programme" value={section("navbar").showProgram} onChange={(v) => updateConfig("navbar", { showProgram: v })} />
          <NavbarToggle label="Sponsors" value={section("navbar").showSponsors} onChange={(v) => updateConfig("navbar", { showSponsors: v })} />
          <NavbarToggle label="Informations" value={section("navbar").showInfos} onChange={(v) => updateConfig("navbar", { showInfos: v })} />
        </SectionCard>

        {/* ── Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3 pb-16">
          <button
            type="button"
            onClick={() => { exportConfig(); showToast("✓ Configuration exportée"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exporter JSON
          </button>

          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" /></svg>
            Importer JSON
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          <button
            type="button"
            onClick={async () => { await resetConfig(); showToast("✓ Configuration réinitialisée"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-sm font-medium transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}