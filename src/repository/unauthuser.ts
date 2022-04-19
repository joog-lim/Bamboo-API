import { EntityRepository, Repository } from "typeorm";
import { UnauthUser } from "../entity/UnauthUser";
import { getKSTNow } from "../util/date";
import { getRandomInteger } from "../util/number";

@EntityRepository(UnauthUser)
export class UnauthUserRepository extends Repository<UnauthUser> {
  getUserInformationBySub(sub: string) {
    return this.findOne(sub);
  }

  async setAuthenticationNumber(subId: string): Promise<string> {
    const authenticationNumber = ("" + getRandomInteger(9999)).padStart(4, "0");
    const expiredAt: Date = getKSTNow();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);
    await this.update(subId, { authenticationNumber, expiredAt });
    return authenticationNumber;
  }

  async checkAuthenticationNumber(
    email: string,
    authenticationNumber: string,
  ): Promise<boolean> {
    return !!(await this.find({ where: { email, authenticationNumber } }))[0];
  }

  async getUnauthUserByEmail(email: string) {
    return (await this.find({ where: { email } }))[0];
  }

  async updateVerified(subId: string, verified: boolean) {
    return this.update(subId, { verified });
  }
}
