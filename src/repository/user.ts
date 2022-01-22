import { EntityRepository, Repository } from "typeorm";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async getIsAdminByEmail(email: string): Promise<boolean> {
    return (
      await this.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .getOne()
    ).isAdmin;
  }

  async getSubByEmail(email: string): Promise<string> {
    return (
      await this.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .getOne()
    ).subId;
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
  }

  async checkUserBySub(subId: string): Promise<User> {
    return (await this.find({ select: ["subId"], where: { subId } }))[0];
  }
}
