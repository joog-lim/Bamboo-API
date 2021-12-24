import { EntityRepository, Repository } from "typeorm";
import { ModifyAlgorithmDTO } from "../DTO/algorithm.dto";

import { Algorithm } from "../entity";

@EntityRepository(Algorithm)
export class AlgorithmRepository extends Repository<Algorithm> {
  async getAlgorithmCountAtAll() {
    return this.createQueryBuilder("algorithm")
      .select("algorithm.algorithmStatus AS status")
      .addSelect("COUNT(*) AS count")
      .groupBy("algorithm.algorithmStatus")
      .getRawMany();
  }

  async modifyAlgorithm(id: number, data: ModifyAlgorithmDTO) {
    return this.update(id, data);
  }

  async deleteAlgorithm(id: number) {
    return this.delete(id);
  }
}
