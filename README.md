# EP-CONSTRUCTION

## Prérequis

- **Node.js** installé sur votre machine
- **PHP** et **Composer** installés sur votre machine
- **MySQL** ou tout autre SGBD compatible avec le projet

---

## Installation

1. **Cloner le projet depuis GitHub** (si ce n'est pas déjà fait) :

   ```bash
   git clone https://github.com/Malk2375/hackathon-ep-construction.git
   cd hackathon-ep-construction
   ```

2. **Installer les dépendances du backend (Symfony)** :

   Si vous n'avez pas encore installé **Composer**, vous pouvez le faire en suivant les instructions ici : https://getcomposer.org/doc/00-intro.md

   Ensuite, dans le dossier du projet, lancez :

   ```bash
   composer install
   ```

   Cette commande va installer toutes les dépendances PHP nécessaires pour le backend Symfony.

3. **Installer les dépendances du frontend (React)** :

   Dans le dossier du projet, installez les dépendances pour l'application React avec `npm` :

   ```bash
   npm install
   ```

---

## Lancer les serveurs

### 1. **Lancer le serveur Symfony (backend)** :

   Pour démarrer le serveur Symfony, utilisez la commande suivante :

   ```bash
   symfony serve
   ```

   Si vous n'utilisez pas Symfony CLI, vous pouvez également lancer le serveur avec **PHP** :

   ```bash
   php -S 127.0.0.1:8000 -t public
   ```

   Le backend sera accessible sur `http://127.0.0.1:8000`.

### 2. **Lancer le serveur React (frontend)** :

   Pour lancer le serveur de développement React, exécutez cette commande dans le dossier du frontend :

   ```bash
   npm start
   ```

   Le frontend sera accessible sur `http://localhost:3000`.

---

## Créer la base de données

### 1. **Configurer la base de données** :
   Si vous n'avez pas encore configuré votre base de données, vous devez modifier les paramètres de connexion à la base de données dans le fichier `.env` du projet Symfony.

   Exemple de paramètres dans `.env` :

   ```dotenv
   DATABASE_URL="mysql://username:password@localhost:3306/nom_de_la_base"
   ```

   Remplacez `username`, `password` et `nom_de_la_base` par les informations correspondant à votre base de données.

### 2. **Créer la base de données** :

   Pour créer la base de données, exécutez la commande suivante :

   ```bash
   php bin/console doctrine:database:create
   ```

---

## Migrer la base de données

Pour appliquer les migrations à la base de données et créer les tables nécessaires :

```bash
php bin/console doctrine:migrations:migrate
```

Cela appliquera toutes les migrations à la base de données.

---

## Importer les données

### 1. **Fichier SQL** :

   Il y a un fichier SQL dans le projet (`UML2 - Maquettes - BDD/sql/ep_construction.sql`) qui contient les données de départ. Vous pouvez l'importer directement dans votre base de données MySQL avec la commande suivante (assurez-vous que la base de données est créée au préalable) :

   ```bash
   mysql -u username -p nom_de_la_base < sql/ep_construction.sql
   ```

   Remplacez `username` et `nom_de_la_base` par les informations de votre base de données.

---

## Résumé des commandes

Voici un résumé des principales commandes pour démarrer le projet :

- **Installer les dépendances (backend)** : `composer install`
- **Installer les dépendances (frontend)** : `npm install`
- **Lancer le serveur Symfony (backend)** : `symfony serve` ou `php -S 127.0.0.1:8000 -t public`
- **Lancer le serveur React (frontend)** : `npm start`
- **Créer la base de données** : `php bin/console doctrine:database:create`
- **Appliquer les migrations** : `php bin/console doctrine:migrations:migrate`
- **Importer les données depuis le fichier SQL** : `mysql -u username -p nom_de_la_base < sql/ep_construction.sql`

  
## Auteurs

- **Evan AFONSO** - [Profil GitHub](https://github.com/EvanAfonso91)
- **Imen Cherrak** - [Profil GitHub](https://github.com/Imenosto)
- **Alexandre Rocha** - [Profil GitHub](https://github.com/AlexandreRochaQ)
- **Abdelmalek DORBANI** - [Profil GitHub](https://github.com/Malk2375)
```
