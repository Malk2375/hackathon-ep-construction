<?php

namespace App\Repository;

use App\Entity\ChantierCompetence;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ChantierCompetence>
 *
 * @method ChantierCompetence|null find($id, $lockMode = null, $lockVersion = null)
 * @method ChantierCompetence|null findOneBy(array $criteria, array $orderBy = null)
 * @method ChantierCompetence[]    findAll()
 * @method ChantierCompetence[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ChantierCompetenceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ChantierCompetence::class);
    }
} 