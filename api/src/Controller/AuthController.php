<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

#[Route('/api')]
class AuthController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private UserRepository $userRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        UserRepository $userRepository
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->userRepository = $userRepository;
    }

    #[Route('/login', name: 'app_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['mail']) || !isset($data['password'])) {
            return $this->json(['message' => 'Email et mot de passe requis'], Response::HTTP_BAD_REQUEST);
        }
        
        $user = $this->userRepository->findOneBy(['mail' => $data['mail']]);
        
        if (!$user) {
            return $this->json(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }
        
        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Générer un token simple (à remplacer par JWT dans un environnement de production)
        $token = bin2hex(random_bytes(32));
        
        return $this->json([
            'user' => $user,
            'token' => $token
        ], Response::HTTP_OK, [], ['groups' => 'user:read']);
    }

    #[Route('/register', name: 'app_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        // Vérifier si l'email existe déjà
        $existingUser = $this->userRepository->findOneBy(['mail' => $data['mail']]);
        if ($existingUser) {
            return $this->json(['message' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
        }
        
        $user = new User();
        $user->setNom($data['nom']);
        $user->setPrenom($data['prenom']);
        $user->setMail($data['mail']);
        $user->setRole($data['role'] ?? 'ROLE_USER');
        
        // Hasher le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setMdp($hashedPassword);
        
        if (isset($data['adresse'])) {
            $user->setAdresse($data['adresse']);
        }
        
        $this->entityManager->persist($user);
        $this->entityManager->flush();
        
        return $this->json($user, Response::HTTP_CREATED, [], ['groups' => 'user:read']);
    }
} 