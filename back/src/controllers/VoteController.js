import db from "../models/index.js";

const { Vote, VoteHistory, MovieJury, User, Movie } = db;

/**
 * GET /votes — Récupère tous les votes (ADMIN)
 */
async function getVote(req, res) {
    try {
        const votes = await Vote.findAll({
            include: [
                { model: User, attributes: ["id_user", "first_name", "last_name", "email"], required: false },
                { model: Movie, attributes: ["id_movie", "title"], required: false },
                { model: VoteHistory, as: "history", required: false, separate: true, order: [["createdAt", "ASC"]] }
            ]
        });
        return res.json(votes);
    } catch (err) {
        console.error("getVote error:", err);
        return res.status(500).json({ error: err.message });
    }
}

/**
 * POST /:id_movie/:id_user — Crée un vote (ADMIN uniquement)
 *
 * FIX CRITIQUE: réécriture en async/await pour éviter le double envoi de réponse.
 * L'ancienne version chaînait deux .then() — quand un vote existant était trouvé,
 * res.status(409).json() retournait l'objet `res` (truthy), qui était ensuite reçu
 * par le .then(newVote => { if (newVote) res.status(201)... }) comme `newVote`,
 * provoquant un second envoi de réponse et l'erreur "Cannot set headers after sent".
 */
async function createVote(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: "Données manquantes" });
    }

    const { note, comments } = req.body;
    const { id_movie, id_user } = req.params;

    try {
        const existingVote = await Vote.findOne({ where: { id_movie, id_user } });
        if (existingVote) {
            return res.status(409).json({ message: "Vote déjà existant", existingVote });
        }
        const newVote = await Vote.create({ note, comments, id_movie, id_user });
        return res.status(201).json({ message: "Vote créé", newVote });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/**
 * GET /votes/mine — Récupère les votes du jury connecté
 */
async function getMyVotes(req, res) {
    try {
        const id_user = req.user.id_user;
        const votes = await Vote.findAll({
            where: { id_user },
            include: [
                { model: Movie, attributes: ["id_movie", "title"], required: false },
                { model: VoteHistory, as: "history", required: false, separate: true, order: [["createdAt", "ASC"]] }
            ]
        });
        return res.json(votes);
    } catch (err) {
        console.error("getMyVotes error:", err);
        return res.status(500).json({ error: err.message });
    }
}

async function getMyVoteByMovie(req, res) {
    try {
        const id_user = req.user.id_user;
        const { id_movie } = req.params;

        const vote = await Vote.findOne({
            where: { id_user, id_movie },
            include: [
                { model: Movie, attributes: ["id_movie", "title"], required: false },
                { model: VoteHistory, as: "history", required: false, separate: true, order: [["createdAt", "ASC"]] }
            ]
        });
        if (!vote) {
            return res.status(404).json({ error: "Vote non trouvé" });
        }
        return res.json(vote);
    } catch (err) {
        console.error("getMyVoteByMovie error:", err);
        return res.status(500).json({ error: err.message });
    }
}

async function createOrUpdateMyVote(req, res) {
    try {
        const id_user = req.user.id_user;
        const { id_movie } = req.params;
        const { note, comments } = req.body || {};

        if (!["YES", "NO", "TO DISCUSS"].includes(note)) {
            return res.status(400).json({ error: "Note invalide (YES, NO ou TO DISCUSS attendu)" });
        }

        const assigned = await MovieJury.findOne({ where: { id_movie, id_user } });
        if (!assigned) {
            return res.status(403).json({ error: "Film non assigné à ce jury" });
        }

        const movie = await Movie.findByPk(id_movie);
        if (!movie) {
            return res.status(404).json({ error: "Film non trouvé" });
        }

        const status = movie.selection_status;
        if (!["assigned", "to_discuss"].includes(status)) {
            return res.status(400).json({
                error: "Vote non autorisé pour ce statut de film"
            });
        }

        const existingVote = await Vote.findOne({ where: { id_movie, id_user } });
        const normalizedComment = String(comments || "").trim();

        if (existingVote) {
            const existingComment = String(existingVote.comments || "").trim();
            const hasChanges = existingVote.note !== note || existingComment !== normalizedComment;

            const isSecondVote = ["to_discuss", "selected", "finalist"].includes(status);

            if (isSecondVote) {
                await VoteHistory.create({
                    id_vote: existingVote.id_vote,
                    id_movie,
                    id_user,
                    note: existingVote.note,
                    comments: existingVote.comments
                });
                existingVote.modification_count = (existingVote.modification_count || 0) + 1;
            } else if (hasChanges) {
                await VoteHistory.create({
                    id_vote: existingVote.id_vote,
                    id_movie,
                    id_user,
                    note: existingVote.note,
                    comments: existingVote.comments
                });
            }

            existingVote.note = note;
            existingVote.comments = normalizedComment;
            await existingVote.save();

            return res.json({
                message: "Vote mis à jour",
                vote: existingVote,
                isModified: existingVote.modification_count > 0,
                isApproved: movie.selection_status === "selected"
            });
        }

        const newVote = await Vote.create({
            note,
            comments: normalizedComment,
            id_movie,
            id_user,
            modification_count: 0
        });
        return res.status(201).json({ message: "Vote créé", vote: newVote });

    } catch (err) {
        console.error("createOrUpdateMyVote error:", err);
        return res.status(500).json({ error: err.message });
    }
}

function deleteVote(req, res) {
    const { id } = req.params;
    Vote.destroy({ where: { id_vote: id } })
        .then(deleted => {
            if (deleted) res.status(200).json({ message: "Vote supprimé" });
            else res.status(404).json({ error: "Vote non trouvé" });
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

function deleteVotesByMovie(req, res) {
    const { id_movie } = req.params;
    Vote.destroy({ where: { id_movie } })
        .then((deletedCount) => {
            res.status(200).json({ message: "Votes supprimés", deletedCount });
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

/**
 * PUT /:id_vote — Modifier un vote (ADMIN)
 *
 * FIX: `if (comments)` était falsy pour une chaîne vide, rendant impossible
 * l'effacement d'un commentaire existant via comments: "".
 * Correction : `if (comments !== undefined)` accepte explicitement la chaîne vide.
 */
async function updateVote(req, res) {
    const { id_vote } = req.params;
    const { note, comments } = req.body;

    try {
        const vote = await Vote.findOne({ where: { id_vote } });
        if (!vote) return res.status(404).json({ error: "Vote non trouvé" });

        if (note !== undefined && ["YES", "NO", "TO DISCUSS"].includes(note)) {
            vote.note = note;
        }
        // FIX: !== undefined au lieu de truthy — permet d'effacer comments avec ""
        if (comments !== undefined) vote.comments = comments;

        const updatedVote = await vote.save();
        return res.json(updatedVote);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

function getVoteById(req, res) {
    const { id_vote } = req.params;
    Vote.findOne({ where: { id_vote } })
        .then(vote => {
            if (vote) res.json(vote);
            else res.status(404).json({ error: "Vote non trouvé" });
        })
        .catch(err => res.status(500).json({ error: err.message }));
}

export default {
    getVote,
    createVote,
    getMyVotes,
    getMyVoteByMovie,
    createOrUpdateMyVote,
    deleteVote,
    updateVote,
    getVoteById,
    deleteVotesByMovie
};
