import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Cats } from 'src/cats/entities/cat.entity';

@Entity()
export class Favorites {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Cats, (cat) => cat.favorites)
  @JoinColumn({ name: 'cat_id' })
  cat: Cats;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: string;
}
