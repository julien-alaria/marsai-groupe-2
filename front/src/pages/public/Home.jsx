
/**
 * Composant Home (Accueil Publique)
 * Page d'accueil principale accessible à tous les utilisateurs (authentifiés ou non)
 * Affiche un message de bienvenue sur la plateforme du festival
 * @returns {JSX.Element} La page d'accueil avec le message de bienvenue
 */
import { Link } from "react-router";
import Button from "../../components/Button";
import Hero from "../../components/home/Hero";
import Reassure from "../../components/home/Reassure";
import Goals from "../../components/home/Goals";
import Protocole from "../../components/home/Protocole";
import Program from "../../components/home/program";
import Party from "../../components/home/Party";
import Promoters from "../../components/home/Promoters";
import Localisation from "../../components/home/Localisation";
import Statistics from "../../components/home/Statistics";
import Sponsors from "../../components/home/Sponsors";
import { useFestivalConfig } from "../../hooks/useFestivalConfig";
import Selection from "../public/Selection.jsx";
import "./Home.css";

import "./Home.css";

/**
 * Fonction Home
 * Composant de la page d'accueil du festival
 * Importe le fichier CSS personnalisé Home.css pour le style
 * @returns {JSX.Element} Le contenu de la page d'accueil
 */
function Home() {
  const { config } = useFestivalConfig();

  // Helper: return true when section is visible (default to true if config not yet loaded)
  const show = (key) => !config || config[key]?.visible !== false;

  return (
    <>
      {show("hero")        && <Hero />}
      {show("selection")   && <Selection />}
      {show("reassure")    && <Reassure />}
      {show("goals")       && <Goals />}
      {show("protocole")   && <Protocole />}
      {show("program")     && <Program />}
      {show("party")       && <Party />}
      {show("promoters")   && <Promoters />}
      {show("localisation")&& <Localisation />}
      {show("statistics")  && <Statistics />}
      {show("sponsors")    && <Sponsors />}
    </>
  );
}

export default Home;