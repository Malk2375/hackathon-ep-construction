<?php

namespace App\Controller;

use App\Entity\UserCompetence;
use App\Entity\User;
use App\Entity\Competence;
use App\Repository\UserCompetenceRepository;
use App\Repository\UserRepository;
use App\Repository\CompetenceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/user-competences')]
class UserCompetenceController extends AbstractController
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

    #[Route('', name: 'app_user_competence_index', methods: ['GET'])]
    public function index(Request $request, UserCompetenceRepository $userCompetenceRepository): JsonResponse
    {
        // Si un ID utilisateur est fourni, filtrer les résultats
        if ($request->query->has('user_id')) {
            $userId = $request->query->get('user_id');
            $userCompetences = $userCompetenceRepository->findBy(['user' => $userId]);
        } else {
            $userCompetences = $userCompetenceRepository->findAll();
        }
        
        // Préparer un tableau de résultats avec des données complètes
        $result = [];
        foreach ($userCompetences as $uc) {
            $result[] = [
                'id' => $uc->getId(),
                'user_id' => $uc->getUser()->getId(),
                'competence_id' => $uc->getCompetence()->getId(),
                'competence' => [
                    'id' => $uc->getCompetence()->getId(),
                    'nom_competence' => $uc->getCompetence()->getNomCompetence()
                ]
            ];
        }
        
        return $this->json($result, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'app_user_competence_show', methods: ['GET'])]
    public function show(UserCompetence $userCompetence): JsonResponse
    {
        return $this->json($userCompetence, Response::HTTP_OK, [], ['groups' => 'user_competence:read']);
    }

    #[Route('', name: 'app_user_competence_create', methods: ['POST'])]
    public function create(Request $request, UserRepository $userRepository, CompetenceRepository $competenceRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $user = $userRepository->find($data['user_id']);
        $competence = $competenceRepository->find($data['competence_id']);
        
        if (!$user || !$competence) {
            return $this->json(['message' => 'User or Competence not found'], Response::HTTP_NOT_FOUND);
        }
        
        $userCompetence = new UserCompetence();
        $userCompetence->setUser($user);
        $userCompetence->setCompetence($competence);
        
        $this->entityManager->persist($userCompetence);
        $this->entityManager->flush();
        
        return $this->json($userCompetence, Response::HTTP_CREATED, [], ['groups' => 'user_competence:read']);
    }

    #[Route('/{id}', name: 'app_user_competence_update', methods: ['PUT'])]
    public function update(Request $request, UserCompetence $userCompetence, UserRepository $userRepository, CompetenceRepository $competenceRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['user_id'])) {
            $user = $userRepository->find($data['user_id']);
            if (!$user) {
                return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            $userCompetence->setUser($user);
        }
        
        if (isset($data['competence_id'])) {
            $competence = $competenceRepository->find($data['competence_id']);
            if (!$competence) {
                return $this->json(['message' => 'Competence not found'], Response::HTTP_NOT_FOUND);
            }
            $userCompetence->setCompetence($competence);
        }
        
        $this->entityManager->flush();
        
        return $this->json($userCompetence, Response::HTTP_OK, [], ['groups' => 'user_competence:read']);
    }

    #[Route('/{id}', name: 'app_user_competence_delete', methods: ['DELETE'])]
    public function delete(UserCompetence $userCompetence): JsonResponse
    {
        $this->entityManager->remove($userCompetence);
        $this->entityManager->flush();
        
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
} 