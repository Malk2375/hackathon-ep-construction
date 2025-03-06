-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 06 mars 2025 à 14:19
-- Version du serveur : 10.4.27-MariaDB
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ep_construction`
--

-- --------------------------------------------------------

--
-- Structure de la table `affectation`
--

CREATE TABLE `affectation` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `chantier_id` int(11) NOT NULL,
  `date_d` date NOT NULL,
  `date_f` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `affectation`
--

INSERT INTO `affectation` (`id`, `user_id`, `chantier_id`, `date_d`, `date_f`) VALUES
(22, 83, 25, '2025-03-06', '2025-03-20'),
(26, 84, 25, '2025-03-06', '2025-03-20'),
(27, 85, 25, '2025-03-06', '2025-03-20'),
(28, 105, 25, '2025-03-06', '2025-03-20');

-- --------------------------------------------------------

--
-- Structure de la table `chantier`
--

CREATE TABLE `chantier` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `date_d` date NOT NULL,
  `date_f` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `chantier`
--

INSERT INTO `chantier` (`id`, `nom`, `description`, `adresse`, `date_d`, `date_f`) VALUES
(15, 'Chantier n°1', 'Test', 'Test 23', '2025-03-11', '2025-03-12'),
(17, 'Chantier n°2', 'Test', '123 Rue de Paris, 75001 Paris', '2025-03-10', '2025-03-12'),
(19, 'Chantier n°3', 'Test', 'Test', '2025-03-05', '2025-03-07'),
(20, 'Chantier n°4', 'testt', 'test', '2025-03-24', '2025-03-28'),
(25, 'Chantier n°5', 'test', 'test', '2025-03-06', '2025-03-20');

-- --------------------------------------------------------

--
-- Structure de la table `chantier_competence`
--

CREATE TABLE `chantier_competence` (
  `id` int(11) NOT NULL,
  `chantier_id` int(11) NOT NULL,
  `competence_id` int(11) NOT NULL,
  `nb_competence` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `chantier_competence`
--

INSERT INTO `chantier_competence` (`id`, `chantier_id`, `competence_id`, `nb_competence`) VALUES
(36, 15, 3, 1),
(37, 15, 2, 1),
(38, 17, 2, 1),
(39, 19, 2, 1),
(40, 20, 2, 1),
(42, 25, 2, 1);

-- --------------------------------------------------------

--
-- Structure de la table `competence`
--

CREATE TABLE `competence` (
  `id` int(11) NOT NULL,
  `nom_competence` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `competence`
--

INSERT INTO `competence` (`id`, `nom_competence`) VALUES
(1, 'Plaquist'),
(2, 'Peintre'),
(3, 'Maçonnerie'),
(4, 'Carreleur '),
(21, 'Test');

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20250303141110', '2025-03-03 14:11:16', 327);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `role` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `mail` varchar(180) NOT NULL,
  `mdp` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `role`, `nom`, `prenom`, `adresse`, `mail`, `mdp`) VALUES
(53, 'ouvrier', 'Nouveau', 'Test2', '456 Rue Nouveau', 'newuser@example.com', '$2y$13$0stPpinnCMObp.N6LQu9u./dpE8cuWwD3HPpqBuK4iLX4wCAbCqxK'),
(82, 'chef_admin', 'Afonso', 'Evan', '123 Rue de Paris, 75001 Paris', 'admin@admin.com', '$2y$13$IffsK9cxqxMqrhDYPFIYveLYTMGae7trijl0aji79gkzCeGvbBxUy'),
(83, 'ouvrier', 'Doe', 'John', '14 Rue bergère, 75009 Pari', 'ouvrier@test.com', '$2y$13$XhKygyBLoWKAdK6mmjDiCur9MHSo69OZ4GTsk2.ivByvM0J/bVUau'),
(84, 'ouvrier', 'Dupont', 'Jean', '14 Rue bergère, 75009 Paris', 'ouvrier2@test.com', '$2y$13$R1MCOhx321h498JrUaag7.6VnfNmsypmnCZFtJHFwKf4/d9KQuQ6W'),
(85, 'ouvrier', 'Doe', 'Mathos', '123 Rue de Paris, 75001 Paris', 'ouvrier3@test.com', '$2y$13$a1DW1msVt.8kCrL9O0PiTuiCu0sRkcXhEGO58LznqsmX7FEACiBDm'),
(105, 'chef_chantier', 'Jean', 'Charles', 'test', 'chefchantier@test.com', '$2y$13$6FHrFVYlM3FL3RcM/uZiuOW82Nfmrt/v7.FeSGTqrdd0THebMfR5S');

-- --------------------------------------------------------

--
-- Structure de la table `user_competence`
--

CREATE TABLE `user_competence` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `competence_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user_competence`
--

INSERT INTO `user_competence` (`id`, `user_id`, `competence_id`) VALUES
(25, 82, 2),
(26, 82, 3),
(27, 82, 1),
(28, 82, 4),
(29, 83, 1),
(30, 83, 3),
(31, 83, 2),
(32, 83, 4),
(33, 84, 1),
(34, 84, 4),
(35, 84, 2),
(36, 84, 3),
(37, 85, 1),
(38, 85, 3),
(39, 85, 4),
(40, 85, 2);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `affectation`
--
ALTER TABLE `affectation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_F4DD61D3A76ED395` (`user_id`),
  ADD KEY `IDX_F4DD61D3D0C0049D` (`chantier_id`);

--
-- Index pour la table `chantier`
--
ALTER TABLE `chantier`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `chantier_competence`
--
ALTER TABLE `chantier_competence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_E6D6C4ACD0C0049D` (`chantier_id`),
  ADD KEY `IDX_E6D6C4AC15761DAB` (`competence_id`);

--
-- Index pour la table `competence`
--
ALTER TABLE `competence`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_8D93D6495126AC48` (`mail`);

--
-- Index pour la table `user_competence`
--
ALTER TABLE `user_competence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_33B3AE93A76ED395` (`user_id`),
  ADD KEY `IDX_33B3AE9315761DAB` (`competence_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `affectation`
--
ALTER TABLE `affectation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT pour la table `chantier`
--
ALTER TABLE `chantier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT pour la table `chantier_competence`
--
ALTER TABLE `chantier_competence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT pour la table `competence`
--
ALTER TABLE `competence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT pour la table `user_competence`
--
ALTER TABLE `user_competence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `affectation`
--
ALTER TABLE `affectation`
  ADD CONSTRAINT `FK_F4DD61D3A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_F4DD61D3D0C0049D` FOREIGN KEY (`chantier_id`) REFERENCES `chantier` (`id`);

--
-- Contraintes pour la table `chantier_competence`
--
ALTER TABLE `chantier_competence`
  ADD CONSTRAINT `FK_E6D6C4AC15761DAB` FOREIGN KEY (`competence_id`) REFERENCES `competence` (`id`),
  ADD CONSTRAINT `FK_E6D6C4ACD0C0049D` FOREIGN KEY (`chantier_id`) REFERENCES `chantier` (`id`);

--
-- Contraintes pour la table `user_competence`
--
ALTER TABLE `user_competence`
  ADD CONSTRAINT `FK_33B3AE9315761DAB` FOREIGN KEY (`competence_id`) REFERENCES `competence` (`id`),
  ADD CONSTRAINT `FK_33B3AE93A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
