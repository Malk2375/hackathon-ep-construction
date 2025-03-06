<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use App\Entity\Chantier;
use Doctrine\ORM\EntityManagerInterface;

class ChantierControllerTest extends WebTestCase
{
    private $client;
    private $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);
    }

    public function testIndex()
    {
        $this->client->request('GET', '/api/chantiers');

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $this->assertJson($this->client->getResponse()->getContent());
    }

    public function testCreateChantier()
    {
        $this->client->request('POST', '/api/chantiers', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'nom_chantier' => 'Chantier Test',
            'adresse' => '123 Rue de Test',
            'description' => 'Description du chantier test',
            'date_debut' => '2025-01-01',
            'date_fin' => '2025-12-31'
        ]));

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $responseData);
    }

    public function testShowChantier()
    {
        // Création d'un chantier en base de test
        $chantier = new Chantier();
        $chantier->setNom('Chantier existant');
        $chantier->setAdresse('456 Rue de Test');
        $chantier->setDescription('Description existante');
        $chantier->setDateD(new \DateTime('2025-01-01'));
        $chantier->setDateF(new \DateTime('2025-12-31'));

        $this->entityManager->persist($chantier);
        $this->entityManager->flush();

        $this->client->request('GET', '/api/chantiers/' . $chantier->getId());

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $this->assertJson($this->client->getResponse()->getContent());
    }

    public function testUpdateChantier()
    {
        // Création d'un chantier en base de test
        $chantier = new Chantier();
        $chantier->setNom('Chantier à modifier');
        $chantier->setAdresse('789 Rue de Test');
        $chantier->setDescription('Ancienne description');
        $chantier->setDateD(new \DateTime('2025-01-01'));
        $chantier->setDateF(new \DateTime('2025-12-31'));

        $this->entityManager->persist($chantier);
        $this->entityManager->flush();

        $this->client->request('PUT', '/api/chantiers/' . $chantier->getId(), [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'nom_chantier' => 'Chantier Modifié',
            'description' => 'Nouvelle description'
        ]));

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Chantier Modifié', $responseData['nom_chantier']);
        $this->assertEquals('Nouvelle description', $responseData['description']);
    }

    public function testDeleteChantier()
    {
        // Création d'un chantier en base de test
        $chantier = new Chantier();
        $chantier->setNom('Chantier à supprimer');
        $chantier->setAdresse('111 Rue de Test');
        $chantier->setDescription('Description à supprimer');
        $chantier->setDateD(new \DateTime('2025-01-01'));
        $chantier->setDateF(new \DateTime('2025-12-31'));

        $this->entityManager->persist($chantier);
        $this->entityManager->flush();

        $this->client->request('DELETE', '/api/chantiers/' . $chantier->getId());

        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }
}
