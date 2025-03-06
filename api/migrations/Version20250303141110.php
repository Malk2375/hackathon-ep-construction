<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250303141110 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE affectation (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, chantier_id INT NOT NULL, date_d DATE NOT NULL, date_f DATE NOT NULL, INDEX IDX_F4DD61D3A76ED395 (user_id), INDEX IDX_F4DD61D3D0C0049D (chantier_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE chantier (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, adresse VARCHAR(255) DEFAULT NULL, date_d DATE NOT NULL, date_f DATE NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE chantier_competence (id INT AUTO_INCREMENT NOT NULL, chantier_id INT NOT NULL, competence_id INT NOT NULL, nb_competence INT NOT NULL, INDEX IDX_E6D6C4ACD0C0049D (chantier_id), INDEX IDX_E6D6C4AC15761DAB (competence_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE competence (id INT AUTO_INCREMENT NOT NULL, nom_competence VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, role VARCHAR(255) NOT NULL, nom VARCHAR(255) NOT NULL, prenom VARCHAR(255) NOT NULL, adresse VARCHAR(255) DEFAULT NULL, date_de_naissance DATE DEFAULT NULL, mail VARCHAR(180) NOT NULL, mdp VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D6495126AC48 (mail), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_competence (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, competence_id INT NOT NULL, INDEX IDX_33B3AE93A76ED395 (user_id), INDEX IDX_33B3AE9315761DAB (competence_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE affectation ADD CONSTRAINT FK_F4DD61D3A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE affectation ADD CONSTRAINT FK_F4DD61D3D0C0049D FOREIGN KEY (chantier_id) REFERENCES chantier (id)');
        $this->addSql('ALTER TABLE chantier_competence ADD CONSTRAINT FK_E6D6C4ACD0C0049D FOREIGN KEY (chantier_id) REFERENCES chantier (id)');
        $this->addSql('ALTER TABLE chantier_competence ADD CONSTRAINT FK_E6D6C4AC15761DAB FOREIGN KEY (competence_id) REFERENCES competence (id)');
        $this->addSql('ALTER TABLE user_competence ADD CONSTRAINT FK_33B3AE93A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user_competence ADD CONSTRAINT FK_33B3AE9315761DAB FOREIGN KEY (competence_id) REFERENCES competence (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE affectation DROP FOREIGN KEY FK_F4DD61D3A76ED395');
        $this->addSql('ALTER TABLE affectation DROP FOREIGN KEY FK_F4DD61D3D0C0049D');
        $this->addSql('ALTER TABLE chantier_competence DROP FOREIGN KEY FK_E6D6C4ACD0C0049D');
        $this->addSql('ALTER TABLE chantier_competence DROP FOREIGN KEY FK_E6D6C4AC15761DAB');
        $this->addSql('ALTER TABLE user_competence DROP FOREIGN KEY FK_33B3AE93A76ED395');
        $this->addSql('ALTER TABLE user_competence DROP FOREIGN KEY FK_33B3AE9315761DAB');
        $this->addSql('DROP TABLE affectation');
        $this->addSql('DROP TABLE chantier');
        $this->addSql('DROP TABLE chantier_competence');
        $this->addSql('DROP TABLE competence');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE user_competence');
    }
}
