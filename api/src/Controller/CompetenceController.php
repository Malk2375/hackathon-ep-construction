<?php

namespace App\Controller;

use App\Entity\Competence;
use App\Repository\CompetenceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/competences')]
class CompetenceController extends AbstractController
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

    #[Route('', name: 'app_competence_index', methods: ['GET'])]
    public function index(CompetenceRepository $competenceRepository): JsonResponse
    {
        $competences = $competenceRepository->findAll();

        $response = $this->json($competences, Response::HTTP_OK, [], ['groups' => 'competence:read']);
        $response->headers->set('Content-Type', 'application/json; charset=utf-8');

        return $response;
    }

    #[Route('/{id}', name: 'app_competence_show', methods: ['GET'])]
    public function show(Competence $competence): JsonResponse
    {
        $response = $this->json($competence, Response::HTTP_OK, [], ['groups' => 'competence:read']);
        $response->headers->set('Content-Type', 'application/json; charset=utf-8');

        return $response;
    }

    #[Route('', name: 'app_competence_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['nom_competence']) || empty($data['nom_competence'])) {
            return $this->json(['error' => 'Le champ nom_competence est obligatoire'], Response::HTTP_BAD_REQUEST);
        }

        $competence = new Competence();
        $competence->setNomCompetence($data['nom_competence']);

        $this->entityManager->persist($competence);
        $this->entityManager->flush();

        $response = $this->json($competence, Response::HTTP_CREATED, [], ['groups' => 'competence:read']);
        $response->headers->set('Content-Type', 'application/json; charset=utf-8');

        return $response;
    }

    #[Route('/{id}', name: 'app_competence_update', methods: ['PUT'])]
    public function update(Request $request, Competence $competence): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['nom_competence']) || empty($data['nom_competence'])) {
            return $this->json(['error' => 'Le champ nom_competence est obligatoire'], Response::HTTP_BAD_REQUEST);
        }

        $competence->setNomCompetence($data['nom_competence']);
        $this->entityManager->flush();

        $response = $this->json($competence, Response::HTTP_OK, [], ['groups' => 'competence:read']);
        $response->headers->set('Content-Type', 'application/json; charset=utf-8');

        return $response;
    }

    #[Route('/{id}', name: 'app_competence_delete', methods: ['DELETE'])]
    public function delete(Competence $competence): JsonResponse
    {
        $this->entityManager->remove($competence);
        $this->entityManager->flush();

        $response = $this->json(['message' => 'Compétence supprimée avec succès'], Response::HTTP_NO_CONTENT);
        $response->headers->set('Content-Type', 'application/json; charset=utf-8');

        return $response;
    }
}
