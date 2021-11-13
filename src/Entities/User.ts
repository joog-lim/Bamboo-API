import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Emojie } from './emojie';

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    sub_id: string;

    @Column()
    email: string;

    @Column()
    nickname: string;
    
    @Column()
    password: string;

    @Column({type: 'boolean'})
    isStudent: boolean;

    @CreateDateColumn()
    sign_up_time: Date;

    @Column()
    accessToken: string;

    @Column()
    refreshed_at: string;
    
    @Column()
    expired_at: string;

    @Column({type : 'boolean'})
    isAdmin: boolean;

    @OneToMany(type => Emojie, emojie => emojie.user)
    emojies: Emojie[];
}

