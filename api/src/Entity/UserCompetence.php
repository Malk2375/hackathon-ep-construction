<?php

namespace App\Entity;

use App\Repository\UserCompetenceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserCompetenceRepository::class)]
class UserCompetence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user_competence:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'userCompetences')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_competence:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'userCompetences')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_competence:read'])]
    private ?Competence $competence = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getCompetence(): ?Competence
    {
        return $this->competence;
    }

    public function setCompetence(?Competence $competence): static
    {
        $this->competence = $competence;

        return $this;
    }
} 