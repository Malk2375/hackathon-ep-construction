<?php

namespace App\Entity;

use App\Repository\ChantierCompetenceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ChantierCompetenceRepository::class)]
class ChantierCompetence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['chantier_competence:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'chantierCompetences')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['chantier_competence:read'])]
    private ?Chantier $chantier = null;

    #[ORM\ManyToOne(inversedBy: 'chantierCompetences')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['chantier_competence:read'])]
    private ?Competence $competence = null;

    #[ORM\Column]
    #[Groups(['chantier_competence:read'])]
    private ?int $nb_competence = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getChantier(): ?Chantier
    {
        return $this->chantier;
    }

    public function setChantier(?Chantier $chantier): static
    {
        $this->chantier = $chantier;

        return $this;
    }

    public function getCompetence(): ?Competence
    {
        return $this->competence;
    }

    public function setCompetence(?Competence $competence): static
    {
        $this->competence = $competence;

        return $this;
    }

    public function getNbCompetence(): ?int
    {
        return $this->nb_competence;
    }

    public function setNbCompetence(int $nb_competence): static
    {
        $this->nb_competence = $nb_competence;

        return $this;
    }
} 