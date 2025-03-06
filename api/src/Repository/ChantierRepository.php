<?php

namespace App\Repository;

use App\Entity\Chantier;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Chantier>
 *
 * @method Chantier|null find($id, $lockMode = null, $lockVersion = null)
 * @method Chantier|null findOneBy(array $criteria, array $orderBy = null)
 * @method Chantier[]    findAll()
 * @method Chantier[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ChantierRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Chantier::class);
    }
} 