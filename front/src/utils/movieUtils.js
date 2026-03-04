/**
 * movieUtils.js — Shared movie utility functions
 *
 * Centralises getPoster and getTrailer helpers that were previously
 * copy-pasted identically in JuryHome.jsx, ProducerHome.jsx and
 * JuryManagement.jsx. Import from here instead.
 */

import { UPLOAD_BASE } from "./constants.js";

/**
 * Returns the best available poster URL for a movie, checking fields
 * in priority order: thumbnail > display_picture > picture1 > picture2 > picture3.
 * Returns null if no image is available.
 */
export const getPoster = (movie) => {
  if (!movie) return null;
  const field =
    movie.thumbnail ||
    movie.display_picture ||
    movie.picture1 ||
    movie.picture2 ||
    movie.picture3 ||
    null;
  return field ? `${UPLOAD_BASE}/${field}` : null;
};

/**
 * Returns the local video filename for a movie if one exists.
 * Returns null to signal the caller should fall back to youtube_link.
 */
export const getTrailer = (movie) => {
  if (!movie) return null;
  return (
    movie.trailer ||
    movie.trailer_video ||
    movie.trailerVideo ||
    movie.filmFile ||
    movie.video ||
    null
  );
};