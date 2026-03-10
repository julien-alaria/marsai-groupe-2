// Patch section: add movieAwardsInModal state and update handleOpenModal and delete handlers
sed -i '' '20 a\
  const [movieAwardsInModal, setMovieAwardsInModal] = useState([]);
' Awards.jsx

sed -i '' '160,165 s/setShowModal(true);/setMovieAwardsInModal(awards.filter((aw) => aw.id_movie === movie.id_movie) || []);\n    setShowModal(true);/' Awards.jsx
