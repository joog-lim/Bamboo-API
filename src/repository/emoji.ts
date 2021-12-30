import { EntityRepository, Repository } from "typeorm";

import { Emoji } from "../entity";

@EntityRepository(Emoji)
export class EmojiRepository extends Repository<Emoji> {
  async getIdx(subId: string, algorithmNumber: number) {
    return (
      await this.find({ where: { user: subId, algorithm: algorithmNumber } })
    )[0]?.idx;
  }
  async addLeaf(subId: string, algorithmNumber: number) {
    return this.insert({
      user: { subId },
      algorithm: { idx: algorithmNumber },
    });
  }
  async removeLeaf(idx: number) {
    return this.delete(idx);
  }
}
