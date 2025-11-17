import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity({ name: 'teams' })
@Unique(['abbr'])
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 16, nullable: true })
  abbr?: string | null

  @Column({ type: 'varchar', length: 255 })
  nom!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  nom_en?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  nom_ar?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  city?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  city_ar?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  city_en?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  stadium?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  stadium_ar?: string | null

  @Column({ type: 'text', nullable: true })
  logo_url?: string | null

  @Column({ type: 'timestamp', nullable: true })
  created_at?: Date

}


