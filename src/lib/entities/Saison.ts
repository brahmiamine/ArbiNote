import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'saisons' })
export class Saison {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255 })
  nom!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  nom_ar?: string | null

  @Column({ type: 'date', nullable: true })
  date_debut?: string | null

  @Column({ type: 'date', nullable: true })
  date_fin?: string | null

  @Column({ type: 'timestamp', nullable: true })
  created_at?: Date

}


