import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMovies } from '../../api/movies';
import { submitVote } from '../../api/votes';

export default function JuryEvaluation() {

  const { t } = useTranslation();

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: movies } = useQuery({
    queryKey: ['movies'],
    queryFn: getMovies
  });

  const voteMutation = useMutation({
    mutationFn: submitVote,
    onSuccess: () => {
      alert(t("jury.evaluation.success"));
      setSelectedMovie(null);
      setRating(5);
      setComment('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    voteMutation.mutate({
      id_film: selectedMovie.id_movie,
      note: rating,
      commentaire: comment
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("jury.evaluation.title")}</h1>

      {/* Movie Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {movies?.map(movie => (
          <div
            key={movie.id_movie}
            onClick={() => setSelectedMovie(movie)}
            className={`
              p-4 rounded-lg border cursor-pointer
              ${selectedMovie?.id_movie === movie.id_movie
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 hover:border-gray-500'
              }
            `}
          >
            <h3 className="font-bold">{movie.title}</h3>
            <p className="text-sm text-gray-400">{movie.duration} min</p>
          </div>
        ))}
      </div>

      {/* Voting Form */}
      {selectedMovie && (
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            {t("jury.evaluation.rate")}: {selectedMovie.title}
          </h2>

          {/* Rating */}
          <div className="mb-4">
            <label className="block mb-2">{t("jury.evaluation.rating")}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold">{rating}/10</div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block mb-2">{t("jury.evaluation.comment")}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full p-2 bg-gray-800 rounded"
              placeholder="Your feedback..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
            disabled={voteMutation.isLoading}
          >
            {voteMutation.isLoading ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      )}
    </div>
  );
}
// /front/src/pages/jury/JuryEvaluation.jsx
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMovies } from '../../api/movies';
import { submitVote } from '../../api/votes';

export default function JuryEvaluation() {
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: movies } = useQuery({
    queryKey: ['movies'],
    queryFn: getMovies
  });

  const voteMutation = useMutation({
    mutationFn: submitVote,
    onSuccess: () => {
      alert(t("jury.evaluation.success"));

      setSelectedMovie(null);
      setRating(5);
      setComment('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    voteMutation.mutate({
      id_film: selectedMovie.id_movie,
      note: rating,
      commentaire: comment
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("jury.evaluation.title")}</h1>

      {/* Movie Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {movies?.map(movie => (
          <div
            key={movie.id_movie}
            onClick={() => setSelectedMovie(movie)}
            className={`
              p-4 rounded-lg border cursor-pointer
              ${selectedMovie?.id_movie === movie.id_movie
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 hover:border-gray-500'
              }
            `}
          >
            <h3 className="font-bold">{movie.title}</h3>
            <p className="text-sm text-gray-400">{movie.duration} min</p>
          </div>
        ))}
      </div>

      {/* Voting Form */}
      {selectedMovie && (
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            Rate: {selectedMovie.title}
          </h2>

          {/* Rating */}
          <div className="mb-4">
            <label className="block mb-2">{t("jury.evaluation.rating")}</label>

            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold">{rating}/10</div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block mb-2">{t("jury.evaluation.comment")}</label>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full p-2 bg-gray-800 rounded"
              placeholder={t("jury.evaluation.placeholder")}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
            disabled={voteMutation.isLoading}
          >
            {voteMutation.isLoading
  ? t("jury.evaluation.submitting")
  : t("jury.evaluation.submit")}

          </button>
        </form>
      )}
    </div>
  );
}
