import {Entity,PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne} from 'typeorm';
import { Emojie } from './emojie'

@Entity()
export class Algorithem {
    @PrimaryGeneratedColumn()
    post_id: number;

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

    @ManyToOne(type => Algorithem_status, status => status.algorithems)
    algorithem_status: Algorithem_status
}

@Entity()
export class Algorithem_status {
    @PrimaryGeneratedColumn()
    status: string;

    @OneToMany(type => Algorithem, algorithem => algorithem.algorithem_status)
    algorithems: Algorithem[];
}

@Entity()
export class question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    gsm_question: string;
}