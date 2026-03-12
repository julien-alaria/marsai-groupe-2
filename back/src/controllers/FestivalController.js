/**
 * FestivalController.js
 *
 * Gère la phase publique active du festival :
 *   phase 0 → rien n'est affiché publiquement (défaut)
 *   phase 2 → Selection.jsx affiche les films en délibération / sélectionnés
 *   phase 3 → Selection.jsx affiche les films primés (palmarès)
 *
 * La valeur est persistée dans back/config/festival_phase.json
 * pour survivre aux redémarrages du serveur et être visible par tous.
 */

import fs   from "fs";
import path from "path";

const PHASE_FILE = path.join(process.cwd(), "config", "festival_phase.json");

function readPhase() {
  try {
    if (fs.existsSync(PHASE_FILE)) {
      return JSON.parse(fs.readFileSync(PHASE_FILE, "utf-8"));
    }
  } catch { /* ignore */ }
  return { phase: 0, updatedAt: null };
}

function writePhase(data) {
  const dir = path.dirname(PHASE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PHASE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * GET /festival/phase  — PUBLIC
 * Retourne la phase actuellement active.
 */
export function getPhase(req, res) {
  res.json(readPhase());
}

/**
 * PUT /festival/phase  — ADMIN seulement
 * Body: { phase: 0 | 2 | 3 }
 *   0 → masquer la sélection publique
 *   2 → afficher la sélection (films délibérés)
 *   3 → afficher le palmarès (films primés)
 */
export function setPhase(req, res) {
  const { phase } = req.body;

  if (![0, 2, 3].includes(Number(phase))) {
    return res.status(400).json({ error: "Phase invalide (0, 2 ou 3 attendu)" });
  }

  const data = { phase: Number(phase), updatedAt: new Date().toISOString() };
  writePhase(data);
  res.json({ message: "Phase mise à jour", ...data });
}

export default { getPhase, setPhase };