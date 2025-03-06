<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CompetenceControllerTest extends WebTestCase
{
    public function testIndex(): void
    {
        // 1) Créer un client
        $client = static::createClient();

        // 2) Faire la requête GET /api/competences
        $client->request('GET', '/api/competences');

        // 3) Vérifier le code HTTP
        $this->assertResponseIsSuccessful();           // 2xx
        $this->assertResponseHeaderSame('content-type', 'application/json; charset=utf-8');

        // 4) Vérifier le contenu JSON
        $json = $client->getResponse()->getContent();
        $data = json_decode($json, true);

        $this->assertIsArray($data);
        // On peut vérifier que c'est un tableau de compétences
        // ex: s'il y a 0 ou plus. Tout dépend de l'état de ta DB de test.
    }

    public function testCreateCompetence(): void
    {
        $client = static::createClient();

        // Préparer un payload JSON
        $payload = [
            'nom_competence' => 'CompétenceTestPourUnitaire',
        ];

        // Envoyer la requête POST
        $client->request(
            'POST',
            '/api/competences',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        // Vérifier qu'on a 201 Created
        $this->assertResponseStatusCodeSame(201);

        // Vérifier la forme de la réponse
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $data);
        $this->assertEquals('CompétenceTestPourUnitaire', $data['nom_competence']);
    }

    public function testShowCompetence(): void
    {
        $client = static::createClient();

        // D'abord, créer la compétence pour avoir un ID
        $payload = ['nom_competence' => 'CompétenceShow'];
        $client->request(
            'POST',
            '/api/competences',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );
        $this->assertResponseStatusCodeSame(201);

        $data = json_decode($client->getResponse()->getContent(), true);
        $createdId = $data['id'];

        // Maintenant, faire un GET /api/competences/{id}
        $client->request('GET', '/api/competences/'.$createdId);
        $this->assertResponseIsSuccessful();

        $showData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('CompétenceShow', $showData['nom_competence']);
        $this->assertEquals($createdId, $showData['id']);
    }

    public function testUpdateCompetence(): void
    {
        $client = static::createClient();

        // Créer une compétence
        $payload = ['nom_competence' => 'AvantUpdate'];
        $client->request(
            'POST',
            '/api/competences',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );
        $this->assertResponseStatusCodeSame(201);

        $data = json_decode($client->getResponse()->getContent(), true);
        $createdId = $data['id'];

        // Faire un PUT => /api/competences/{id}
        $updatePayload = ['nom_competence' => 'AprèsUpdate'];
        $client->request(
            'PUT',
            '/api/competences/'.$createdId,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($updatePayload)
        );
        $this->assertResponseStatusCodeSame(200);

        $updateData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('AprèsUpdate', $updateData['nom_competence']);
        $this->assertEquals($createdId, $updateData['id']);
    }

    public function testDeleteCompetence(): void
    {
        $client = static::createClient();

        // Créer une compétence
        $payload = ['nom_competence' => 'CompASupprimer'];
        $client->request(
            'POST',
            '/api/competences',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );
        $this->assertResponseStatusCodeSame(201);

        $data = json_decode($client->getResponse()->getContent(), true);
        $createdId = $data['id'];

        // DELETE /api/competences/{id}
        $client->request('DELETE', '/api/competences/'.$createdId);
        $this->assertResponseStatusCodeSame(204); // No Content

        // (optionnel) Vérifier qu'on ne peut plus le récupérer
        $client->request('GET', '/api/competences/'.$createdId);
        $this->assertResponseStatusCodeSame(404);
    }
}
