import { EntityRepository, Repository } from "typeorm";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async getIsAdminByEmail(email: string): Promise<boolean> {
    return !!(
      await this.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .getOne()
    )?.isAdmin;
  }

  async getSubByEmail(email: string): Promise<string> {
    return (
      (
        await this.createQueryBuilder("user")
          .where("user.email = :email", { email })
          .getOne()
      )?.subId ?? ""
    );
  }

  getUserByEmail(email: string): Promise<User | undefined> {
    return this.createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
  }

  getUserByIdAndPw(email: string, pw: string) {
    return this.createQueryBuilder("user").where(
      "user.email = :email AND user.pw = :pw",
      { email, pw },
    );
  }
}
