# Front

Une fois que vous avez cloné le starter kit, être sûr(e) d'être dans le répertoire front

## Installer les dépendances

```sh
npm install
```

## Démarrer le serveur

```sh
npm run dev
```

## Lecture vidéo (Vidstack)

La lecture des films utilise Vidstack. Les styles sont importés dans les pages vidéo (admin, jury, producer).

```js
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
```

## 🌍 Système de traduction (i18n)

Le projet MarsAI Festival utilise i18next avec react-i18next pour gérer le système de traduction multilingue.
Les langues actuellement supportées :

🇫🇷 Français (langue par défaut)
🇬🇧 Anglais

La langue sélectionnée est sauvegardée dans le localStorage afin d’être conservée après actualisation de la page.

### Structure

    Les fichiers de traduction sont situés dans :
    👉 src/locales/
    src/
       └── locales/
          ├── fr.json
          └── en.json

     L’initialisation de i18n est définie dans :
     👉 src/i18n.js

        src/
           ├── i18n.js


     L’import de i18n doit être activé dans :
     👉 src/main.jsx


### Installation des dépendances

Pour activer le système de traduction, installez les dépendances suivantes :

npm install i18next react-i18next


### Activation

Vérifiez que i18n.js est bien importé dans main.jsx :

import "./i18n";

Sans cet import, le système de traduction ne sera pas initialisé.



### Fonctionnement

#### Initialisation

Au chargement de l’application :
      - Si une langue est enregistrée dans localStorage, elle est utilisée.
      - Sinon, la langue par défaut est le français (fr).

lng: localStorage.getItem("lang") || "fr"

#### Changement de langue

Pour changer la langue dynamiquement avec boutons :

<button 
    onClick={() => {
    i18n.changeLanguage('fr');
    localStorage.setItem('lang', 'fr');
  }}
</button>

 <button 
    onClick={() => {
    i18n.changeLanguage('en');
    localStorage.setItem('lang', 'en');
  }}
</button>


#### Utilisation dans un composant React
Les traductions sont appelées dans les composants avec :

const { t } = useTranslation();
t("ma.cle.de.traduction");

Après avoir importer useTranslation depuis react-i18next :

import { useTranslation } from "react-i18next";

