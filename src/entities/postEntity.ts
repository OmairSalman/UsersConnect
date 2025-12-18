import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, JoinColumn, BaseEntity } from "typeorm";
import { User } from "./userEntity";
import { Comment } from "./commentEntity";

@Entity()
export class Post extends BaseEntity
{
  @PrimaryGeneratedColumn("uuid")
  _id!: string

  @Column()
  title!: string

  @Column("text")
  content!: string

  @Column({ nullable: true })
  imageURL?: string
  
  @Column()
  author_id!: string

  @ManyToOne(() => User, (user) => user.posts, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  author!: User

  @OneToMany(() => Comment, comment => comment.post, { cascade: true, eager: true })
  comments!: Comment[]

  @ManyToMany(() => User, { eager: true })
  @JoinTable()
  likes!: User[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}