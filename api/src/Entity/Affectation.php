<?php

namespace App\Entity;

use App\Repository\AffectationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AffectationRepository::class)]
class Affectation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['affectation:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['affectation:read'])]
    private ?\DateTimeInterface $date_d = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['affectation:read'])]
    private ?\DateTimeInterface $date_f = null;

    #[ORM\ManyToOne(inversedBy: 'affectations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['affectation:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'affectations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['affectation:read'])]
    private ?Chantier $chantier = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateD(): ?\DateTimeInterface
    {
        return $this->date_d;
    }

    public function setDateD(\DateTimeInterface $date_d): static
    {
        $this->date_d = $date_d;

        return $this;
    }

    public function getDateF(): ?\DateTimeInterface
    {
        return $this->date_f;
    }

    public function setDateF(\DateTimeInterface $date_f): static
    {
        $this->date_f = $date_f;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
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
} 