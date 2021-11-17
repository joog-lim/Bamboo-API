import {Entity,PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne} from 'typeorm';
import { Emoji } from './emoji'

@Entity()
export class Algorithem {
    @PrimaryGeneratedColumn()
    postId: number;

    @Column()
    postNumber: number;

    @Column()
    title: string;

    @Column({length: 1000})
    content: string;

    @Column()
    tag: string;

    @CreateDateColumn()
    postDate: Date;

    @OneToMany(type => Emoji, emoji => emoji.algorithem)
    emojis: Emoji[];

    @ManyToOne(type => AlgorithemStatus, status => status.algorithems)
    algorithemStatus: AlgorithemStatus
}

@Entity()
export class AlgorithemStatus {
    @PrimaryGeneratedColumn()
    status: string;

    @OneToMany(type => Algorithem, algorithem => algorithem.algorithemStatus)
    algorithems: Algorithem[];
}

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    gsmQuestion: string;
}