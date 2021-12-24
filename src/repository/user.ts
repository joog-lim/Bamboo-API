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
}
