import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NameContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  arabic: string;

  @Column()
  transliteration: string;

  @Column()
  translation: string;

  @Column('jsonb')
  detailedContent: Record<string, any>; // Store detailed content as JSON
}
