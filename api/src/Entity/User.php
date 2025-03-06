<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read', 'affectation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'affectation:read'])]
    private ?string $role = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'affectation:read'])]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'affectation:read'])]
    private ?string $prenom = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'affectation:read'])]
    private ?string $adresse = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Groups(['user:read', 'affectation:read'])]
    private ?string $mail = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'affectation:read'])]
    private ?string $mdp = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Affectation::class)]
    private Collection $affectations;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: UserCompetence::class, orphanRemoval: true)]
    private Collection $userCompetences;

    public function __construct()
    {
        $this->affectations = new ArrayCollection();
        $this->userCompetences = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;

        return $this;
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

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

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

    public function getMail(): ?string
    {
        return $this->mail;
    }

    public function setMail(string $mail): static
    {
        $this->mail = $mail;

        return $this;
    }

    public function getMdp(): ?string
    {
        return $this->mdp;
    }

    public function setMdp(?string $mdp): static
    {
        $this->mdp = $mdp;

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
            $affectation->setUser($this);
        }

        return $this;
    }

    public function removeAffectation(Affectation $affectation): static
    {
        if ($this->affectations->removeElement($affectation)) {
            // set the owning side to null (unless already changed)
            if ($affectation->getUser() === $this) {
                $affectation->setUser(null);
            }
        }

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
            $userCompetence->setUser($this);
        }

        return $this;
    }

    public function removeUserCompetence(UserCompetence $userCompetence): static
    {
        if ($this->userCompetences->removeElement($userCompetence)) {
            // set the owning side to null (unless already changed)
            if ($userCompetence->getUser() === $this) {
                $userCompetence->setUser(null);
            }
        }

        return $this;
    }

    // Méthodes requises par UserInterface
    public function getUserIdentifier(): string
    {
        return (string) $this->mail;
    }

    public function getRoles(): array
    {
        return [$this->role];
    }

    public function getPassword(): string
    {
        return (string) $this->mdp;
    }

    public function eraseCredentials(): void
    {
        // Si vous stockez des données temporaires sensibles sur l'utilisateur, effacez-les ici
    }
} 