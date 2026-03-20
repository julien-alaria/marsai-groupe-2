[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/lmmHya3U)

# Starter Kit (kit de démarrage) pour le projet MarsAI

## Prérequis

- Node.js 24+ (nvm)
- Express
- MySQL 8+
- React.js avec Vite

## Avoir la dernière version LTS de Node.js

```sh
nvm install 24.13.0

nvm use 24.13.0
```

## Installer les dépendences front et back

```sh
npm install
```

## Lancer le serveur back

```sh
npm run back
```

## Lancer le serveur front

```sh
npm run fron
```

## Lecture vidéo

La lecture des films côté front utilise Vidstack (@vidstack/react). Les styles sont importés dans les pages admin/jury/producer.

```sh
install npm install recharts
```

---

# 🚀 Déploiement du site sur Hostinger

## 📦 FRONTEND (React)

### 1. Build du projet

Dans le terminal (VS Code) :

```bash
npm run build
```

Cela génère un dossier `dist`.

---

### 2. Déploiement sur Hostinger

1. Aller sur **Liste des sites**
2. Cliquer sur **Ajouter un site web**
3. Choisir :
   - Site web **PHP/HTML**
4. Choisir :
   - Le type de site
   - Le **nom de domaine**
5. L’espace disque est configuré automatiquement

---

### 3. Upload des fichiers

1. Aller dans le **Gestionnaire de fichiers**
2. Ouvrir le dossier :

```bash
public_html
```

3. Glisser le **contenu** du dossier `dist` (pas le dossier lui-même)

---

### 4. Vérification

Accéder au site via le **nom de domaine**

---

## ⚙️ BACKEND (Node.js)

### 1. Préparation

- Créer un repository GitHub du backend

---

### 2. Déploiement sur Hostinger

1. Aller sur **Liste des sites**
2. Cliquer sur **Ajouter un site web**
3. Choisir :
   - **Application web Node.js**
4. Choisir le **nom de domaine**
5. Continuer avec **GitHub**
6. Sélectionner votre repository

---

### 3. Configuration

#### Paramètre important :

- Fichier d'entrée :

```bash
bootstrap.cjs
```

---

### 4. Variables d’environnement

1. Copier le fichier `.env`
2. Le renommer :

```bash
env.txt
```

3. Sur Hostinger :
   - Aller dans **Variables d'environnement**
   - Cliquer sur **Importer un fichier .env**
   - Importer `env.txt`

4. Supprimer : PORT=3000


---

### 5. Déploiement

- Cliquer sur **Déployer**

---

## 🗄️ Base de données

### 1. Création

1. Aller dans **Base de données**
2. Cliquer sur **Gestion**
3. Créer une nouvelle base

---

### 2. Import

1. Aller dans **phpMyAdmin**
2. Importer le fichier :

```bash
.sql
```

---

### 3. Configuration du backend

1. Aller dans **Déploiements**
2. Cliquer sur **Paramètres et redéploiement**
3. Modifier :
   - Host
   - User
   - Password
   - Database
4. Enregistrer
5. Redéployer

---

## ✅ Résultat

- Front accessible via le domaine
- Backend fonctionnel
- Base de données connectée

---

## ⚠️ Notes importantes

- Ne pas uploader le dossier `dist`, seulement son contenu
- Vérifier les variables d’environnement
- Vérifier la configuration de la base de données
- Ne pas fixer de port (Hostinger le gère)