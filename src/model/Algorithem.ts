import {Entity,PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne} from 'typeorm';
import { Emojie } from './emojie'

@Entity()
export class Algorithem {
    @PrimaryGeneratedColumn()
    post_id: number;

    @Column()
    post_number: number;

    @Column()
    title: string;

    @Column({length: 1000})
    content: string;

    @Column()
    tag: string;

    @CreateDateColumn()
    postDate: Date;

    @OneToMany(type => Emojie, emojie => emojie.algorithem)
    emojies: Emojie[];

    @ManyToOne(type => AlgorithemStatus, status => status.algorithems)
    algorithem_status: AlgorithemStatus
}

@Entity()
export class AlgorithemStatus {
    @PrimaryGeneratedColumn()
    status: string;

    @OneToMany(type => Algorithem, algorithem => algorithem.algorithem_status)
    algorithems: Algorithem[];
}

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    gsm_question: string;
}