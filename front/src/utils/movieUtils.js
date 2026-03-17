/**
 * movieUtils.js — Shared movie utility functions
 *
 * Centralises getPoster and getTrailer helpers that were previously
 * copy-pasted identically in JuryHome.jsx, ProducerHome.jsx and
 * JuryManagement.jsx. Import from here instead.
 */

import { UPLOAD_BASE } from "./constants.js";

function getYoutubeVideoId(movie) {
  if (!movie) return null;
  if (typeof movie.youtube_movie_id === "string" && movie.youtube_movie_id.trim()) {
    return movie.youtube_movie_id.trim();
  }

  const rawLink = typeof movie.youtube_link === "string" ? movie.youtube_link.trim() : "";
  if (!rawLink) return null;

  try {
    const url = new URL(rawLink);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace(/^\//, "") || null;
    }
    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v") || null;
    }
  } catch {
    return null;
  }

  return null;
}

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
  if (field) return `${UPLOAD_BASE}/${field}`;

  const youtubeVideoId = getYoutubeVideoId(movie);
  return youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg` : null;
};

/**
 * Returns the local video filename for a movie if one exists.
 * Returns null to signal the caller should fall back to youtube_link.
 */
export const getTrailer = (movie) => {
  if (!movie) return null;
  if (typeof movie.youtube_link === "string" && movie.youtube_link.trim()) {
    return null;
  }
  return (
    movie.trailer ||
    movie.trailer_video ||
    movie.trailerVideo ||
    movie.filmFile ||
    movie.video ||
    null
  );
};