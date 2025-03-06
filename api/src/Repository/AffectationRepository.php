<?php

namespace App\Repository;

use App\Entity\Affectation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Affectation>
 *
 * @method Affectation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Affectation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Affectation[]    findAll()
 * @method Affectation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AffectationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Affectation::class);
    }
    
    /**
     * Trouve les affectations qui se chevauchent pour un utilisateur donné
     */
    public function findOverlappingAssignments(User $user, \DateTime $startDate, \DateTime $endDate, ?int $excludeId = null)
    {
        $qb = $this->createQueryBuilder('a')
            ->where('a.user = :user')
            ->andWhere('(a.date_d <= :end_date AND a.date_f >= :start_date)')
            ->setParameter('user', $user)
            ->setParameter('start_date', $startDate)
            ->setParameter('end_date', $endDate);
            
        if ($excludeId) {
            $qb->andWhere('a.id != :id')
               ->setParameter('id', $excludeId);
        }
        
        return $qb->getQuery()->getResult();
    }
} 