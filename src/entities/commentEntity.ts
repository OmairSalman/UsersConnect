import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./userEntity";
import { Post } from "./postEntity";

@Entity()
export class Comment extends BaseEntity
{
  @PrimaryGeneratedColumn("uuid")
  _id!: string

  @Column("text")
  content!: string

  // Foreign key column for author
  @Column()
  author_id!: string

  @ManyToOne(() => User, (user) => user.comments, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  author!: User

  // Foreign key column for post
  @Column()
  post_id!: string

  @ManyToOne(() => Post, post => post.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post!: Post

  @ManyToMany(() => User, { eager: true })
  @JoinTable()
  likes!: User[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}