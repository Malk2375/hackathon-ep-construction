<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/users')]
class UserController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('', name: 'app_user_index', methods: ['GET'])]
    public function index(UserRepository $userRepository): JsonResponse
    {
        try {
            $users = $userRepository->findAll();
            
            // Créer un tableau simplifié manuellement
            $simplifiedUsers = [];
            foreach ($users as $user) {
                $simplifiedUsers[] = [
                    'id' => $user->getId(),
                    'nom' => $user->getNom(),
                    'prenom' => $user->getPrenom(),
                    'mail' => $user->getMail(),
                    'role' => $user->getRole(),
                    'adresse' => $user->getAdresse()
                ];
            }
            
            return new JsonResponse($simplifiedUsers, Response::HTTP_OK);
        } catch (\Exception $e) {
            // Journaliser l'erreur
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_user_show', methods: ['GET'])]
    public function show(User $user): JsonResponse
    {
        try {
            $simplifiedUser = [
                'id' => $user->getId(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'mail' => $user->getMail(),
                'role' => $user->getRole(),
                'adresse' => $user->getAdresse()
            ];
            
            return new JsonResponse($simplifiedUser, Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', name: 'app_user_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            $user = new User();
            $user->setNom($data['nom']);
            $user->setPrenom($data['prenom']);
            $user->setMail($data['mail']);
            $user->setRole($data['role'] ?? 'ROLE_USER');
            
            if (isset($data['mdp'])) {
                $hashedPassword = $this->passwordHasher->hashPassword($user, $data['mdp']);
                $user->setMdp($hashedPassword);
            }
            
            if (isset($data['adresse'])) {
                $user->setAdresse($data['adresse']);
            }
            
            $this->entityManager->persist($user);
            $this->entityManager->flush();
            
            $simplifiedUser = [
                'id' => $user->getId(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'mail' => $user->getMail(),
                'role' => $user->getRole(),
                'adresse' => $user->getAdresse()
            ];
            
            return new JsonResponse($simplifiedUser, Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_user_update', methods: ['PUT'])]
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (isset($data['nom'])) {
                $user->setNom($data['nom']);
            }
            
            if (isset($data['prenom'])) {
                $user->setPrenom($data['prenom']);
            }
            
            if (isset($data['mail'])) {
                $user->setMail($data['mail']);
            }
            
            if (isset($data['role'])) {
                $user->setRole($data['role']);
            }
            
            if (isset($data['mdp'])) {
                $hashedPassword = $this->passwordHasher->hashPassword($user, $data['mdp']);
                $user->setMdp($hashedPassword);
            }
            
            if (isset($data['adresse'])) {
                $user->setAdresse($data['adresse']);
            }
            
            $this->entityManager->flush();
            
            $simplifiedUser = [
                'id' => $user->getId(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'mail' => $user->getMail(),
                'role' => $user->getRole(),
                'adresse' => $user->getAdresse()
            ];
            
            return new JsonResponse($simplifiedUser, Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_user_delete', methods: ['DELETE'])]
    public function delete(User $user): JsonResponse
    {
        try {
            $this->entityManager->remove($user);
            $this->entityManager->flush();
            
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 