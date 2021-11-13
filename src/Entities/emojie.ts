import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { User } from './User'
import { Algorithem } from './Algorithem'

@Entity()
export class Emojie {
    @PrimaryGeneratedColumn()
    emojie_status: string;

    @ManyToOne(type => User, user => user.emojies)
    user: User;

    @ManyToOne(type => Algorithem, algorithem => algorithem.emojies)
    algorithem: Algorithem;
}