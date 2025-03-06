<?php

namespace App\Entity;

use App\Repository\ChantierRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ChantierRepository::class)]
class Chantier
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['chantier:read', 'affectation:read', 'chantier_competence:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['chantier:read', 'affectation:read', 'chantier_competence:read'])]
    private ?string $nom = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['chantier:read', 'affectation:read'])]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['chantier:read', 'affectation:read'])]
    private ?string $adresse = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['chantier:read', 'affectation:read'])]
    private ?\DateTimeInterface $date_d = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['chantier:read', 'affectation:read'])]
    private ?\DateTimeInterface $date_f = null;

    #[ORM\OneToMany(mappedBy: 'chantier', targetEntity: Affectation::class, orphanRemoval: true)]
    private Collection $affectations;

    #[ORM\OneToMany(mappedBy: 'chantier', targetEntity: ChantierCompetence::class, orphanRemoval: true)]
    private Collection $chantierCompetences;

    public function __construct()
    {
        $this->affectations = new ArrayCollection();
        $this->chantierCompetences = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
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

    /**
     * @return Collection<int, Affectation>
     */
    public function getAffectations(): Collection
    {
        return $this->affectations;
    }

    public function addAffectation(Affectation $affectation): static
    {
        if (!$this->affectations->contains($affectation)) {
            $this->affectations->add($affectation);
            $affectation->setChantier($this);
        }

        return $this;
    }

    public function removeAffectation(Affectation $affectation): static
    {
        if ($this->affectations->removeElement($affectation)) {
            // set the owning side to null (unless already changed)
            if ($affectation->getChantier() === $this) {
                $affectation->setChantier(null);
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
            $chantierCompetence->setChantier($this);
        }

        return $this;
    }

    public function removeChantierCompetence(ChantierCompetence $chantierCompetence): static
    {
        if ($this->chantierCompetences->removeElement($chantierCompetence)) {
            // set the owning side to null (unless already changed)
            if ($chantierCompetence->getChantier() === $this) {
                $chantierCompetence->setChantier(null);
            }
        }

        return $this;
    }
} 