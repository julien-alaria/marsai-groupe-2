import db from "../models/index.js";
import { Op, fn, col } from "sequelize";

const {
  User,
  Movie,
  Vote,
  Award,
  Categorie
} = db;

/**
 * Admin Dashboard Statistics Controller
 * GET /admin/dashboard
 */
export const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);

    const [
      totalUsers,
      totalMovies,
      totalVotes,
      totalAwards,
      totalCategories,
      juryCount
    ] = await Promise.all([
      User.count(),
      Movie.count(),
      Vote.count(),
      Award.count(),
      Categorie.count(),
      User.count({ where: { role: "JURY" } })
    ]);

    const newUsersToday = await User.count({
      where: { createdAt: { [Op.gte]: today } }
    });

    const filmsEvaluated = await Vote.count({
      distinct: true,
      col: "id_movie"
    });

    const selectedMovies = await Movie.count({
      where: { selection_status: "selected" }
    });

    const [yesCount, noCount, toDiscussCount] = await Promise.all([
      Vote.count({ where: { note: "YES" } }),
      Vote.count({ where: { note: "NO" } }),
      Vote.count({ where: { note: "TO DISCUSS" } })
    ]);

    // FIX: was counting ALL distinct voters regardless of role.
    // Two-step approach avoids Sequelize's broken SQL generation when using
    // count + distinct + col + include together.
    // Step 1: get all jury user IDs
    const juryUsers = await User.findAll({
      where: { role: "JURY" },
      attributes: ["id_user"]
    });
    const juryIds = juryUsers.map(u => u.id_user);
    // Step 2: count how many of those have voted
    const juryWhoVoted = juryIds.length > 0
      ? await Vote.count({
          distinct: true,
          col: "id_user",
          where: { id_user: { [Op.in]: juryIds } }
        })
      : 0;

    const juryParticipationRate = juryCount > 0
      ? Math.round((juryWhoVoted / juryCount) * 100)
      : 0;

    const votesTrendRaw = await Vote.findAll({
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("COUNT", col("id_vote")), "count"]
      ],
      where: { createdAt: { [Op.gte]: last7Days } },
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]]
    });

    const votesTrend = votesTrendRaw.map(v => ({
      date: v.get("date"),
      count: Number(v.get("count"))
    }));

    const pipelineRaw = await Movie.findAll({
      attributes: [
        "selection_status",
        [fn("COUNT", col("id_movie")), "count"]
      ],
      group: ["selection_status"]
    });

    const pipeline = {};
    pipelineRaw.forEach(row => {
      pipeline[row.selection_status] = Number(row.get("count"));
    });

    res.json({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        jury: juryCount,
        juryWhoVoted,
        juryParticipationRate
      },
      movies: {
        total: totalMovies,
        evaluated: filmsEvaluated,
        selected: selectedMovies,
        pipeline
      },
      votes: {
        total: totalVotes,
        trend: votesTrend,
        distribution: {
          yes: yesCount,
          no: noCount,
          toDiscuss: toDiscussCount
        }
      },
      awards: { total: totalAwards },
      categories: { total: totalCategories }
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      error: "Failed to load admin dashboard stats",
      details: error.message
    });
  }
};