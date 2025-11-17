import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Match } from './Match'
import { Arbitre } from './Arbitre'

@Entity({ name: 'votes' })
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Match, (match) => match.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'match_id' })
  match!: Match

  @Column({ type: 'uuid' })
  match_id!: string

  @ManyToOne(() => Arbitre, (arbitre) => arbitre.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'arbitre_id' })
  arbitre!: Arbitre

  @Column({ type: 'uuid' })
  arbitre_id!: string

  @Column({ type: 'json' })
  criteres!: Record<string, number>

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  note_globale!: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_fingerprint?: string | null

  @Column({ type: 'timestamp', nullable: true })
  created_at?: Date
}


