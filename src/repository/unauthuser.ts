import { EntityRepository, Repository } from "typeorm";
import { UnauthUser } from "../entity/UnauthUser";
import { getKSTNow } from "../util/date";
import { getRandomInteger } from "../util/number";

@EntityRepository(UnauthUser)
export class UnauthUserRepository extends Repository<UnauthUser> {
  getUserInformationBySub(sub: string) {
    return this.findOne(sub);
  }

  async setAuthenticationNumber(sub: string): Promise<number> {
    const authenticationNumber = getRandomInteger(9999);
    const expiredAt: Date = getKSTNow();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);
    await this.update(sub, { authenticationNumber, expiredAt });
    return authenticationNumber;
  }

  async getUnauthUserBySubAndNumber(
    subId: string,
    num: number,
  ): Promise<UnauthUser> {
    return (
      await this.find({ where: { subId, authenticationNumber: num } })
    )[0];
  }
}
