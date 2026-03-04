// scripts/import-movies-users.js
// Imports users and movies from exported JSON files into the database. Skips existing entries.
import fs from 'fs';
import db from '../src/models/index.js';

async function importMoviesAndUsers() {
  try {
    const { Movie, User } = db;
    // Read users and movies from JSON files
    const users = JSON.parse(fs.readFileSync('./exported-users.json', 'utf-8'));
    const movies = JSON.parse(fs.readFileSync('./exported-movies.json', 'utf-8'));

    // Insert users (skip if already exists by email)
    for (const user of users) {
      const [u] = await User.findOrCreate({
        where: { email: user.email },
        defaults: user
      });
    }
    console.log(`✓ Imported/Found ${users.length} users`);

    // Insert movies (skip if already exists by title)
    for (const movie of movies) {
      const [m] = await Movie.findOrCreate({
        where: { title: movie.title },
        defaults: movie
      });
    }
    console.log(`✓ Imported/Found ${movies.length} movies`);
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

importMoviesAndUsers();
