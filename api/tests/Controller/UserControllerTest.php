<?php

namespace App\Tests\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserControllerTest extends WebTestCase
{
    private $client;
    private $entityManager;
    private $passwordHasher;
    private $testUser;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $this->passwordHasher = static::getContainer()->get(UserPasswordHasherInterface::class);

        // Suppression uniquement de l'utilisateur de test précédent
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['mail' => 'test@example.com']);
        if ($existingUser) {
            $this->entityManager->remove($existingUser);
            $this->entityManager->flush();
        }

        // Création d'un nouvel utilisateur test
        $user = new User();
        $user->setNom('Test');
        $user->setPrenom('User');
        $user->setMail('test@example.com');
        $user->setRole('ouvrier');
        $user->setAdresse('123 Rue du Test');
        $user->setMdp($this->passwordHasher->hashPassword($user, 'password123'));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Récupérer l'utilisateur en base (pour éviter un ID en mémoire perdu)
        $this->testUser = $this->entityManager->getRepository(User::class)->findOneBy(['mail' => 'test@example.com']);
    }

    public function testIndexUsers(): void
    {
        $this->client->request('GET', '/api/users');
        $this->assertResponseIsSuccessful();
    }

    public function testShowUser(): void
    {
        $this->client->request('GET', '/api/users/' . $this->testUser->getId());
        $this->assertResponseIsSuccessful();
    }

    public function testUpdateUser(): void
    {
        $updatePayload = ['nom' => 'Smith'];

        $this->client->request(
            'PUT',
            '/api/users/' . $this->testUser->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($updatePayload)
        );
        $this->assertResponseIsSuccessful();

        // Vérifier en base que l'utilisateur a bien été modifié
        $this->entityManager->clear();
        $updatedUser = $this->entityManager->getRepository(User::class)->find($this->testUser->getId());
        $this->assertEquals('Smith', $updatedUser->getNom());
    }

    public function testDeleteUser(): void
    {
        // 🔹 Stocker l'ID avant suppression
        $userId = $this->testUser->getId();
        $this->assertNotNull($userId, "L'ID de l'utilisateur ne doit pas être null avant suppression.");

        // 🔹 Suppression de l'utilisateur
        $this->client->request('DELETE', '/api/users/' . $userId);
        $this->assertResponseStatusCodeSame(204);

        // 🔹 Nettoyer Doctrine (évite les problèmes de cache)
        $this->entityManager->clear();

        // 🔹 Vérifier que l'utilisateur est bien supprimé sans déclencher d'erreur
        $deletedUser = $this->entityManager->getRepository(User::class)->find($userId);
        $this->assertNull($deletedUser, "L'utilisateur doit être supprimé de la base de données.");
    }

    protected function tearDown(): void
    {
        if ($this->testUser && $this->testUser->getId()) {
            $user = $this->entityManager->getRepository(User::class)->find($this->testUser->getId());
            if ($user) {
                $this->entityManager->remove($user);
                $this->entityManager->flush();
            }
        }

        parent::tearDown();
    }
}
