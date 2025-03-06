<?php

namespace App\Entity;

use App\Repository\CompetenceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CompetenceRepository::class)]
class Competence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['competence:read', 'user_competence:read', 'chantier_competence:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['competence:read', 'user_competence:read', 'chantier_competence:read'])]
    private ?string $nom_competence = null;

    #[ORM\OneToMany(mappedBy: 'competence', targetEntity: UserCompetence::class, orphanRemoval: true)]
    private Collection $userCompetences;

    #[ORM\OneToMany(mappedBy: 'competence', targetEntity: ChantierCompetence::class, orphanRemoval: true)]
    private Collection $chantierCompetences;

    public function __construct()
    {
        $this->userCompetences = new ArrayCollection();
        $this->chantierCompetences = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNomCompetence(): ?string
    {
        return $this->nom_competence;
    }

    public function setNomCompetence(string $nom_competence): static
    {
        $this->nom_competence = $nom_competence;

        return $this;
    }

    /**
     * @return Collection<int, UserCompetence>
     */
    public function getUserCompetences(): Collection
    {
        return $this->userCompetences;
    }

    public function addUserCompetence(UserCompetence $userCompetence): static
    {
        if (!$this->userCompetences->contains($userCompetence)) {
            $this->userCompetences->add($userCompetence);
            $userCompetence->setCompetence($this);
        }

        return $this;
    }

    public function removeUserCompetence(UserCompetence $userCompetence): static
    {
        if ($this->userCompetences->removeElement($userCompetence)) {
            // set the owning side to null (unless already changed)
            if ($userCompetence->getCompetence() === $this) {
                $userCompetence->setCompetence(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ChantierCompetence>
     */
    public function getChantierCompetences(): Collection
    {
        return $this->chantierCompetences;
    }

    public function addChantierCompetence(ChantierCompetence $chantierCompetence): static
    {
        if (!$this->chantierCompetences->contains($chantierCompetence)) {
            $this->chantierCompetences->add($chantierCompetence);
            $chantierCompetence->setCompetence($this);
        }

        return $this;
    }

    public function removeChantierCompetence(ChantierCompetence $chantierCompetence): static
    {
        if ($this->chantierCompetences->removeElement($chantierCompetence)) {
            // set the owning side to null (unless already changed)
            if ($chantierCompetence->getCompetence() === $this) {
                $chantierCompetence->setCompetence(null);
            }
        }

        return $this;
    }
} 