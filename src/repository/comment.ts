import { EntityRepository, Repository } from "typeorm";
import { Comment } from "../entity";

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  async addComment({
    subId,
    idx,
    content,
  }: {
    subId: string;
    idx: number;
    content: string;
  }) {
    try {
      await this.insert({ user: { subId }, algorithm: { idx }, content });
      return true;
    } catch (e: unknown) {
      console.error(e);
      return false;
    }
  }
  deleteComment({ idx }: { idx: number }) {
    return this.delete(idx);
  }
}
