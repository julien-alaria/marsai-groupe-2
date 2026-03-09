import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import db from "../src/models/index.js";

const sponsorsData = {
  officiels: [
    { name: "UNDP", logo: "undp.png", url: "https://www.undp.org/" },
    { name: "GYBN", logo: "logo_gybn.png", url: "https://www.gybn.org/" },
    { name: "psl", logo: "psl.png", url: "https://psl.eu/" },
    { name: "cnc", logo: "matrice-logo.png", url: "https://www.cnc.fr/professionnels/aides-et-financements/creation-numerique/fonds-daide-aux-createurs-video-sur-internet-cnc-talent_190814" },
    { name: "action campaign", logo: "action_campaign.png", url: "https://sdgactioncampaign.org/" },
    { name: "UNRIC", logo: "unric.png", url: "https://unric.org/fr/" },
    { name: "SACD", logo: "logo_sacd.png", url: "https://www.sacd.fr/fr" },
    { name: "agence du court metrage", logo: "acm_logo.png", url: "https://www.agencecm.com/" },
    { name: "extra court", logo: "extracourt_logo.png", url: "https://www.lextracourt.com/" },
    { name: "UNESCO", logo: "unesco.jpg", url: "https://www.unesco.org/" }
  ],
  medias: [
    { name: "bio-addict", logo: "logo_boaddict.png", url: "https://www.bioaddict.fr/" },
    { name: "topito", logo: "topito.png", url: "https://www.topito.com/" },
    { name: "bioguia", logo: "logos_biogua.png", url: "https://www.bioguia.com/" },
    { name: "sens critique", logo: "sens_critique.png", url: "https://www.senscritique.com/" },
    { name: "action socialter", logo: "logo-socialter.png", url: "https://www.socialter.fr/" },
    { name: "Universo média", logo: "universo_media.png", url: "https://www.ehuniverso.media/" },
    { name: "Alors", logo: "alors.png", url: "https://linktr.ee/AlorsMedia?fbclid=IwAR1HLGXMiqbsbQp8k6XPFw14HyelcJw9X0sYXUCtAjxGmonY6xhLgNRRXGU" }
  ],
  techniques: [
    { name: "dotsub", logo: "dotsub.png", url: "https://dotsub.com/" },
    { name: "brooklyn", logo: "brooklyn.jpg", url: "https://www.brooklynstorylab.net/" }
  ],
  divers: [
    { name: "1% planet", logo: "1_planet.png", url: "https://www.onepercentfortheplanet.fr/" },
    { name: "Akatu", logo: "akatu.png", url: "https://akatu.org.br/" },
    { name: "Aworld", logo: "logo_aworld.png", url: "https://site.aworld.org/" },
    { name: "Mc Auley", logo: "macaulay.png", url: "https://macaulay.cuny.edu/" },
    { name: "maison du film", logo: "maisondufilm.png", url: "https://maisondufilm.com/" },
    { name: "ligue les droits de l'homme", logo: "logo-ldh-2.png", url: "https://www.ldh-france.org/" },
    { name: "Ecoprod", logo: "logo-ecoprod.png", url: "https://ecoprod.com/adherents/frame-the-witch/" },
    { name: "humeco", logo: "logo-humeco.png", url: "https://humeco.fr/" },
    { name: "casa encendida", logo: "lce_2_lineas_verde.png", url: "https://www.lacasaencendida.es/" },
    { name: "peace one day", logo: "peace_oneday.png", url: "https://www.peaceoneday.org/Main/" },
    { name: "secoya", logo: "secoya.png", url: "https://secoya-ecotournage.com/" },
    { name: "Despierta", logo: "nuevologodespierta.png", url: "https://asociaciondespierta.org/" },
    { name: "iucn", logo: "iucn.jpg", url: "https://natureforall.global/home/" },
    { name: "le projet imagine", logo: "logo-lpi-2.png", url: "https://www.leprojetimagine.com/" }
  ]
};

async function updateSponsors() {
  try {
    for (const [category, sponsors] of Object.entries(sponsorsData)) {
      for (const sponsor of sponsors) {
        const logoPath = `/uploads/sponsors/${sponsor.logo}`;

        const existingSponsor = await db.Sponsor.findOne({
          where: { name: sponsor.name }
        });

        if (existingSponsor) {
          await existingSponsor.update({
            logo: logoPath,
            url: sponsor.url,
            category: category
          });
          console.log(`Sponsor mis à jour : ${sponsor.name}`);
        } else {
          await db.Sponsor.create({
            name: sponsor.name,
            logo: logoPath,
            url: sponsor.url,
            category: category
          });
          console.log(`Sponsor créé : ${sponsor.name}`);
        }
      }
    }

    console.log("Mise à jour des sponsors terminée.");
  } catch (error) {
    console.error("Erreur seed sponsors :", error);
  } finally {
    await db.sequelize.close();
  }
}

updateSponsors();