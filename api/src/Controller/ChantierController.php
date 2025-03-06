<?php

namespace App\Controller;

use App\Entity\Chantier;
use App\Repository\ChantierRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/chantiers')]
class ChantierController extends AbstractController
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

    /**
     * Calcule le statut du chantier en fonction de ses dates
     */
    private function calculateStatus(Chantier $chantier): string
    {
        $today = new \DateTime();
        $dateDebut = $chantier->getDateD();
        $dateFin = $chantier->getDateF();
        
        if (!$dateDebut || !$dateFin) {
            return 'Non défini';
        }
        
        if ($today < $dateDebut) {
            return 'Planifié';
        } else if ($today > $dateFin) {
            return 'Terminé';
        } else {
            return 'En cours';
        }
    }

    #[Route('', name: 'app_chantier_index', methods: ['GET'])]
    public function index(ChantierRepository $chantierRepository): JsonResponse
    {
        try {
            $chantiers = $chantierRepository->findAll();
            
            // Format manually for better control
            $formattedChantiers = [];
            foreach ($chantiers as $chantier) {
                $formattedChantiers[] = [
                    'id' => $chantier->getId(),
                    'nom_chantier' => $chantier->getNom(),
                    'adresse' => $chantier->getAdresse(),
                    'description' => $chantier->getDescription(),
                    'date_debut' => $chantier->getDateD() ? $chantier->getDateD()->format('Y-m-d') : null,
                    'date_fin' => $chantier->getDateF() ? $chantier->getDateF()->format('Y-m-d') : null,
                    'statut' => $this->calculateStatus($chantier)
                ];
            }
            
            return new JsonResponse($formattedChantiers, Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_chantier_show', methods: ['GET'])]
    public function show(Chantier $chantier): JsonResponse
    {
        try {
            $formattedChantier = [
                'id' => $chantier->getId(),
                'nom_chantier' => $chantier->getNom(),
                'adresse' => $chantier->getAdresse(),
                'description' => $chantier->getDescription(),
                'date_debut' => $chantier->getDateD() ? $chantier->getDateD()->format('Y-m-d') : null,
                'date_fin' => $chantier->getDateF() ? $chantier->getDateF()->format('Y-m-d') : null,
                'statut' => $this->calculateStatus($chantier)
            ];
            
            return new JsonResponse($formattedChantier, Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', name: 'app_chantier_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Validation des champs essentiels
            if (!isset($data['nom_chantier']) || empty(trim($data['nom_chantier']))) {
                return new JsonResponse(['error' => 'Le nom du chantier est requis'], Response::HTTP_BAD_REQUEST);
            }
            
            $chantier = new Chantier();
            $chantier->setNom($data['nom_chantier']);
            
            // Description (optionnel)
            if (isset($data['description'])) {
                $chantier->setDescription($data['description']);
            }
            
            // Adresse (optionnel)
            if (isset($data['adresse'])) {
                $chantier->setAdresse($data['adresse']);
            }
            
            // Date début (obligatoire)
            if (!isset($data['date_debut'])) {
                return new JsonResponse(['error' => 'La date de début est requise'], Response::HTTP_BAD_REQUEST);
            }
            
            try {
                $dateDebut = new \DateTime($data['date_debut']);
                $chantier->setDateD($dateDebut);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Format de date de début invalide'], Response::HTTP_BAD_REQUEST);
            }
            
            // Date fin (obligatoire ou optionnelle selon l'application)
            if (isset($data['date_fin']) && !empty($data['date_fin'])) {
                try {
                    $dateFin = new \DateTime($data['date_fin']);
                    $chantier->setDateF($dateFin);
                } catch (\Exception $e) {
                    return new JsonResponse(['error' => 'Format de date de fin invalide'], Response::HTTP_BAD_REQUEST);
                }
            } else {
                // Date de fin par défaut (peut-être une année après la date de début)
                $dateFin = clone $dateDebut;
                $dateFin->modify('+1 year');
                $chantier->setDateF($dateFin);
            }
            
            $this->entityManager->persist($chantier);
            $this->entityManager->flush();
            
            $formattedChantier = [
                'id' => $chantier->getId(),
                'nom_chantier' => $chantier->getNom(),
                'adresse' => $chantier->getAdresse(),
                'description' => $chantier->getDescription(),
                'date_debut' => $chantier->getDateD() ? $chantier->getDateD()->format('Y-m-d') : null,
                'date_fin' => $chantier->getDateF() ? $chantier->getDateF()->format('Y-m-d') : null,
                'statut' => $this->calculateStatus($chantier)
            ];
            
            return new JsonResponse($formattedChantier, Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la création du chantier: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_chantier_update', methods: ['PUT'])]
    public function update(Request $request, Chantier $chantier): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (isset($data['nom_chantier']) && !empty(trim($data['nom_chantier']))) {
                $chantier->setNom($data['nom_chantier']);
            }
            
            // Ajouter la gestion de la description
            if (isset($data['description'])) {
                $chantier->setDescription($data['description']);
            }
            
            if (isset($data['adresse'])) {
                $chantier->setAdresse($data['adresse']);
            }
            
            if (isset($data['date_debut']) && !empty($data['date_debut'])) {
                try {
                    $dateDebut = new \DateTime($data['date_debut']);
                    $chantier->setDateD($dateDebut);
                } catch (\Exception $e) {
                    return new JsonResponse(['error' => 'Format de date de début invalide'], Response::HTTP_BAD_REQUEST);
                }
            }
            
            if (isset($data['date_fin'])) {
                if (!empty($data['date_fin'])) {
                    try {
                        $dateFin = new \DateTime($data['date_fin']);
                        $chantier->setDateF($dateFin);
                    } catch (\Exception $e) {
                        return new JsonResponse(['error' => 'Format de date de fin invalide'], Response::HTTP_BAD_REQUEST);
                    }
                }
                // On ne met pas à null la date de fin car elle est requise dans le modèle
            }
            
            $this->entityManager->flush();
            
            $formattedChantier = [
                'id' => $chantier->getId(),
                'nom_chantier' => $chantier->getNom(),
                'adresse' => $chantier->getAdresse(),
                'description' => $chantier->getDescription(),
                'date_debut' => $chantier->getDateD() ? $chantier->getDateD()->format('Y-m-d') : null,
                'date_fin' => $chantier->getDateF() ? $chantier->getDateF()->format('Y-m-d') : null,
                'statut' => $this->calculateStatus($chantier)
            ];
            
            return new JsonResponse($formattedChantier, Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la mise à jour du chantier: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_chantier_delete', methods: ['DELETE'])]
    public function delete(Chantier $chantier): JsonResponse
    {
        try {
            $this->entityManager->remove($chantier);
            $this->entityManager->flush();
            
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 