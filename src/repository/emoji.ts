import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from "typeorm";

import { Emoji } from "../entity";

@EntityRepository(Emoji)
export class EmojiRepository extends Repository<Emoji> {
  async getIdx(subId: string, algorithmIdx: number): Promise<number> {
    return (
      await this.find({
        where: { user: subId, algorithm: { idx: algorithmIdx } },
      })
    )[0]?.idx;
  }

  addLeaf(subId: string, algorithmNumber: number): Promise<InsertResult> {
    return this.insert({
      user: { subId },
      algorithm: { idx: algorithmNumber },
    });
  }

  removeLeaf(idx: number): Promise<DeleteResult> {
    return this.delete(idx);
  }
}
