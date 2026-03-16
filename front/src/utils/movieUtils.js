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

/**
 * BUG #2 FIX — isPending
 * Returns true when a video has been submitted (trailer field is set)
 * but has NOT yet been processed by the YouTube watcher.
 * The watcher moves the file to uploads/uploaded/ and updates the DB
 * with a path starting with "uploaded/". Until then the video is pending.
 */
export const isPending = (movie) =>
  !!movie?.trailer && !movie.trailer.startsWith("uploaded/");

/**
 * BUG #2 FIX — isYouTubeAccepted
 * Returns true when the YouTube watcher has finished processing the video:
 * trailer starts with "uploaded/" AND a youtube_link has been written to DB.
 */
export const isYouTubeAccepted = (movie) =>
  !!movie?.trailer?.startsWith("uploaded/") && !!movie?.youtube_link;