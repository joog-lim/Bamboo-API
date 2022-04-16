import { EntityRepository, Repository } from "typeorm";

import { Question } from "../entity";

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  async checkQuestionAnswer(id: string, answer: string): Promise<boolean> {
    return !id ? false : (await this.findOne(id))?.answer === answer;
  }

  async getVerifyQuestion(): Promise<Omit<Question, "answer">> {
    const count = await this.count();
    const random: number = ~~(Math.random() * count);

    return (
      await this.find({ select: ["id", "question"], skip: random, take: 1 })
    )[0];
  }
}
