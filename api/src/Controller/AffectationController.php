<?php

namespace App\Controller;

// Importation des entités liées aux affectations, utilisateurs et chantiers
use App\Entity\Affectation;
// Importation des repositories pour accéder aux données en base
use App\Repository\AffectationRepository;
use App\Repository\UserRepository;
use App\Repository\ChantierRepository;
// Importation du gestionnaire d'entités de Doctrine
use Doctrine\ORM\EntityManagerInterface;
// Importation du contrôleur de base de Symfony
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
// Importation des classes pour la gestion des réponses HTTP
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
// Importation de l'annotation permettant de définir les routes
use Symfony\Component\Routing\Attribute\Route;
// Importation du service de sérialisation pour transformer les objets en JSON
use Symfony\Component\Serializer\SerializerInterface;

// Définition de la route principale du contrôleur
#[Route('/api/affectations')]
class AffectationController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;

    // Injection des services nécessaires au contrôleur via le constructeur
    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
    }

    // Route pour récupérer toutes les affectations
    #[Route('', name: 'app_affectation_index', methods: ['GET'])]
    public function index(AffectationRepository $affectationRepository): JsonResponse
    {
        // Récupération de toutes les affectations en base
        $affectations = $affectationRepository->findAll();
        
        // Retour des données en JSON avec un groupe de sérialisation spécifique
        return $this->json($affectations, Response::HTTP_OK, [], ['groups' => 'affectation:read']);
    }

    // Route pour récupérer une affectation spécifique par son ID
    #[Route('/{id}', name: 'app_affectation_show', methods: ['GET'])]
    public function show(Affectation $affectation): JsonResponse
    {
        // Retour de l'affectation demandée en JSON
        return $this->json($affectation, Response::HTTP_OK, [], ['groups' => 'affectation:read']);
    }

    // Route pour créer une nouvelle affectation
    #[Route('', name: 'app_affectation_create', methods: ['POST'])]
    public function create(Request $request, UserRepository $userRepository, ChantierRepository $chantierRepository): JsonResponse
    {
        // Décodage des données JSON envoyées dans la requête
        $data = json_decode($request->getContent(), true);
        
        // Récupération de l'utilisateur et du chantier correspondants aux IDs fournis
        $user = $userRepository->find($data['user_id']);
        $chantier = $chantierRepository->find($data['chantier_id']);
        
        // Vérification de l'existence de l'utilisateur et du chantier
        if (!$user || !$chantier) {
            return $this->json(['message' => 'User or Chantier not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Création d'une nouvelle affectation
        $affectation = new Affectation();
        $affectation->setUser($user);
        $affectation->setChantier($chantier);
        $affectation->setDateD(new \DateTime($data['date_d']));
        $affectation->setDateF(new \DateTime($data['date_f']));
        
        // Vérification des conflits d'affectation
        $existingAffectations = $this->entityManager->getRepository(Affectation::class)->findBy(['user' => $user]);
        
        foreach ($existingAffectations as $existing) {
            $newStart = $affectation->getDateD();
            $newEnd = $affectation->getDateF();
            $existingStart = $existing->getDateD();
            $existingEnd = $existing->getDateF();
            
            // Vérification du chevauchement des périodes d'affectation
            if ($newStart <= $existingEnd && $newEnd >= $existingStart) {
                return $this->json([
                    'message' => 'Conflit d\'affectation détecté',
                    'conflict' => [
                        'existing' => [
                            'id' => $existing->getId(),
                            'chantier' => $existing->getChantier()->getNom(),
                            'date_d' => $existing->getDateD()->format('Y-m-d'),
                            'date_f' => $existing->getDateF()->format('Y-m-d')
                        ]
                    ]
                ], Response::HTTP_CONFLICT);
            }
        }
        
        // Sauvegarde de la nouvelle affectation en base
        $this->entityManager->persist($affectation);
        $this->entityManager->flush();
        
        return $this->json($affectation, Response::HTTP_CREATED, [], ['groups' => 'affectation:read']);
    }

    // Route pour mettre à jour une affectation existante
    #[Route('/{id}', name: 'app_affectation_update', methods: ['PUT'])]
    public function update(Request $request, Affectation $affectation, UserRepository $userRepository, ChantierRepository $chantierRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['user_id'])) {
            $user = $userRepository->find($data['user_id']);
            if (!$user) {
                return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            $affectation->setUser($user);
        }
        
        if (isset($data['chantier_id'])) {
            $chantier = $chantierRepository->find($data['chantier_id']);
            if (!$chantier) {
                return $this->json(['message' => 'Chantier not found'], Response::HTTP_NOT_FOUND);
            }
            $affectation->setChantier($chantier);
        }
        
        if (isset($data['date_d'])) {
            $affectation->setDateD(new \DateTime($data['date_d']));
        }
        
        if (isset($data['date_f'])) {
            $affectation->setDateF(new \DateTime($data['date_f']));
        }
        
        // Sauvegarde des modifications en base
        $this->entityManager->flush();
        
        return $this->json($affectation, Response::HTTP_OK, [], ['groups' => 'affectation:read']);
    }

    // Route pour supprimer une affectation
    #[Route('/{id}', name: 'app_affectation_delete', methods: ['DELETE'])]
    public function delete(Affectation $affectation): JsonResponse
    {
        // Suppression de l'affectation
        $this->entityManager->remove($affectation);
        $this->entityManager->flush();
        
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
