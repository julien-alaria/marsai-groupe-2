import db from "../models/index.js";
import fs from "fs";
import path from "path";

const Sponsor = db.Sponsor;


 //*******************************************************/ CREATE

/*export const createSponsor = async (req, res) => {
  try {
    const { name, logo, url, category } = req.body;

    if (!name || !logo) {
      return res.status(400).json({
        error: "Name and logo are required"
      });
    }

    const sponsor = await Sponsor.create({
      name,
      logo,
      url,
      category
    });

    return res.status(201).json(sponsor);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};*/

////////////////////////////////////////////////////////////////////////////// CREATE AVEC UPLOAD LOGO

export const createSponsor = async (req, res) => {
  try {
    const { name, url, category } = req.body;

    if (!name || !req.file) {
      return res.status(400).json({
        error: "Name and logo are required"
      });
    }

    const logoPath = `/uploads/sponsors/${req.file.filename}`;

    const sponsor = await Sponsor.create({
      name,
      logo: logoPath,
      url,
      category
    });

    return res.status(201).json(sponsor);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


 //*********************************************************/ GET ALL
 
export const getAllSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json(sponsors);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


 //**********************************************************/ GET ONE
 
export const getSponsorById = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await Sponsor.findByPk(id);

    if (!sponsor) {
      return res.status(404).json({
        error: "Sponsor not found"
      });
    }

    return res.status(200).json(sponsor);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


 //********************************************************/ UPDATE

/*export const updateSponsor = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await Sponsor.findByPk(id);

    if (!sponsor) {
      return res.status(404).json({
        error: "Sponsor not found"
      });
    }

    await sponsor.update(req.body);

    return res.status(200).json(sponsor);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};*/

////////////////////////////////////////////////////////////////////////////// UPDATE AVEC UPLOAD LOGO

export const updateSponsor = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await Sponsor.findByPk(id);

    if (!sponsor) {
      return res.status(404).json({
        error: "Sponsor not found"
      });
    }

    let updatedData = {
      name: req.body.name,
      url: req.body.url,
      category: req.body.category
    };

    if (req.file) {
      updatedData.logo = `/uploads/sponsors/${req.file.filename}`;
    }

    await sponsor.update(updatedData);

    return res.status(200).json(sponsor);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 //******************************************************* DELETE
 */


export const deleteSponsor = async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await Sponsor.findByPk(id);

    if (!sponsor) {
      return res.status(404).json({
        error: "Sponsor not found"
      });
    }

    //  Supprimer le fichier image s'il existe
    if (sponsor.logo) {
      const filePath = path.join(process.cwd(), sponsor.logo);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    //  Supprimer le sponsor en base
    await sponsor.destroy();

    return res.status(200).json({
      message: "Sponsor and logo deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};






export default {
  createSponsor,
  getAllSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor
};
