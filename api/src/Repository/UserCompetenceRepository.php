<?php

namespace App\Repository;

use App\Entity\UserCompetence;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserCompetence>
 *
 * @method UserCompetence|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserCompetence|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserCompetence[]    findAll()
 * @method UserCompetence[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserCompetenceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserCompetence::class);
    }
} 