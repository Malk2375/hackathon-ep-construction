<?php

namespace App\Controller;

use App\Entity\ChantierCompetence;
use App\Entity\Chantier;
use App\Entity\Competence;
use App\Repository\ChantierCompetenceRepository;
use App\Repository\ChantierRepository;
use App\Repository\CompetenceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/chantier-competences')]
class ChantierCompetenceController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'app_chantier_competence_index', methods: ['GET'])]
    public function index(Request $request, ChantierCompetenceRepository $chantierCompetenceRepository): JsonResponse
    {
        try {
            $chantierId = $request->query->get('chantier_id');
            $competenceId = $request->query->get('competence_id');
            
            if ($chantierId) {
                $chantierCompetences = $chantierCompetenceRepository->findBy(['chantier' => $chantierId]);
            } elseif ($competenceId) {
                $chantierCompetences = $chantierCompetenceRepository->findBy(['competence' => $competenceId]);
            } else {
                $chantierCompetences = $chantierCompetenceRepository->findAll();
            }
            
            // Créer un tableau simplifié manuellement
            $simplifiedResults = [];
            foreach ($chantierCompetences as $association) {
                $simplifiedResults[] = [
                    'id' => $association->getId(),
                    'chantier' => [
                        'id' => $association->getChantier()->getId()
                    ],
                    'competence' => [
                        'id' => $association->getCompetence()->getId(),
                        'nom_competence' => $association->getCompetence()->getNomCompetence()
                    ]
                ];
            }
            
            return new JsonResponse($simplifiedResults, Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_chantier_competence_show', methods: ['GET'])]
    public function show(ChantierCompetence $chantierCompetence): JsonResponse
    {
        try {
            $simplifiedResult = [
                'id' => $chantierCompetence->getId(),
                'chantier' => [
                    'id' => $chantierCompetence->getChantier()->getId(),
                ],
                'competence' => [
                    'id' => $chantierCompetence->getCompetence()->getId(),
                    'nom_competence' => $chantierCompetence->getCompetence()->getNomCompetence()
                ]
            ];
            
            return new JsonResponse($simplifiedResult, Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', name: 'app_chantier_competence_create', methods: ['POST'])]
    public function create(Request $request, ChantierRepository $chantierRepository, CompetenceRepository $competenceRepository): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Log des données reçues pour débogage
            error_log('Données reçues pour création chantier-compétence: ' . print_r($data, true));
            
            // Validation des données d'entrée
            if (!isset($data['chantier_id']) || !isset($data['competence_id'])) {
                return new JsonResponse(['error' => 'Les champs chantier_id et competence_id sont obligatoires'], Response::HTTP_BAD_REQUEST);
            }
            
            // Convertir en entiers pour éviter les problèmes de typage
            $chantierId = (int) $data['chantier_id'];
            $competenceId = (int) $data['competence_id'];
            
            // Récupérer les entités
            $chantier = $chantierRepository->find($chantierId);
            $competence = $competenceRepository->find($competenceId);
            
            if (!$chantier) {
                return new JsonResponse(['error' => "Chantier non trouvé avec l'ID: $chantierId"], Response::HTTP_NOT_FOUND);
            }
            
            if (!$competence) {
                return new JsonResponse(['error' => "Compétence non trouvée avec l'ID: $competenceId"], Response::HTTP_NOT_FOUND);
            }
            
            // Vérifier si l'association existe déjà
            $existingAssociation = $this->entityManager->getRepository(ChantierCompetence::class)->findOneBy([
                'chantier' => $chantier,
                'competence' => $competence
            ]);
            
            if ($existingAssociation) {
                return new JsonResponse(['message' => 'Cette association existe déjà'], Response::HTTP_OK);
            }
            
            // Créer la nouvelle association
            $chantierCompetence = new ChantierCompetence();
            $chantierCompetence->setChantier($chantier);
            $chantierCompetence->setCompetence($competence);
            // Ajouter une valeur par défaut pour nb_competence (obligatoire)
            $chantierCompetence->setNbCompetence($data['nb_competence'] ?? 1);
            
            $this->entityManager->persist($chantierCompetence);
            $this->entityManager->flush();
            
            return new JsonResponse([
                'id' => $chantierCompetence->getId(),
                'message' => 'Association créée avec succès'
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            error_log('Erreur lors de la création chantier-compétence: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return new JsonResponse([
                'error' => 'Erreur lors de la création de l\'association: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_chantier_competence_update', methods: ['PUT'])]
    public function update(Request $request, ChantierCompetence $chantierCompetence, ChantierRepository $chantierRepository, CompetenceRepository $competenceRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['chantier_id'])) {
            $chantier = $chantierRepository->find($data['chantier_id']);
            if (!$chantier) {
                return $this->json(['message' => 'Chantier not found'], Response::HTTP_NOT_FOUND);
            }
            $chantierCompetence->setChantier($chantier);
        }
        
        if (isset($data['competence_id'])) {
            $competence = $competenceRepository->find($data['competence_id']);
            if (!$competence) {
                return $this->json(['message' => 'Competence not found'], Response::HTTP_NOT_FOUND);
            }
            $chantierCompetence->setCompetence($competence);
        }
        
        if (isset($data['nb_competence'])) {
            $chantierCompetence->setNbCompetence($data['nb_competence']);
        }
        
        $this->entityManager->flush();
        
        return $this->json($chantierCompetence, Response::HTTP_OK, [], ['groups' => 'chantier_competence:read']);
    }

    #[Route('/{id}', name: 'app_chantier_competence_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $chantierCompetence = $this->entityManager->getRepository(ChantierCompetence::class)->find($id);
            
            if (!$chantierCompetence) {
                return new JsonResponse(['error' => 'Association non trouvée'], Response::HTTP_NOT_FOUND);
            }
            
            $this->entityManager->remove($chantierCompetence);
            $this->entityManager->flush();
            
            return new JsonResponse(['message' => 'Association supprimée avec succès'], Response::HTTP_OK);
        } catch (\Exception $e) {
            error_log('Erreur lors de la suppression de l\'association chantier-compétence: ' . $e->getMessage());
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/by-chantier/{chantierId}', name: 'app_chantier_competence_delete_by_chantier', methods: ['DELETE'])]
    public function deleteByChantier(int $chantierId, ChantierCompetenceRepository $repository): JsonResponse
    {
        try {
            $entities = $repository->findBy(['chantier' => $chantierId]);
            
            if (empty($entities)) {
                return new JsonResponse(['message' => 'Aucune association trouvée pour ce chantier'], Response::HTTP_OK);
            }
            
            foreach ($entities as $entity) {
                $this->entityManager->remove($entity);
            }
            
            $this->entityManager->flush();
            
            return new JsonResponse(['message' => 'Associations supprimées avec succès'], Response::HTTP_OK);
        } catch (\Exception $e) {
            error_log('Erreur lors de la suppression des associations: ' . $e->getMessage());
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 