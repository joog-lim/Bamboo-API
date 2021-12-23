import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";

import { JoinAlgorithmDTO } from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";

@EntityRepository(Algorithm)
export class AlgorithmRepository extends Repository<Algorithm> {
  getListByCursor({ count, cursor, status, isAdmin }: JoinAlgorithmDTO) {
    function addOptions(algorithmList: SelectQueryBuilder<Algorithm>) {
      return algorithmList.take(count).orderBy("postNumber", "DESC").getMany();
    }

    const base = this.createQueryBuilder("algorithm").where(
      "algorithm.algorithmStatus = :status",
      {
        status: isAdmin ? status : "PENDING",
      }
    );

    return addOptions(
      !!cursor
        ? base.andWhere("algorithm.postNumber <= :cursor", { cursor })
        : base
    );
  }

  getListByPage({ count, page, status, isAdmin }: JoinAlgorithmDTO) {
    function addOptions(algorithmList: SelectQueryBuilder<Algorithm>) {
      return algorithmList.take(count).orderBy("postNumber", "DESC").getMany();
    }

    const base = this.createQueryBuilder("algorithm").where(
      "algorithm.algorithmStatus = :status",
      {
        status: isAdmin ? status : "PENDING",
      }
    );

    return addOptions(!!page ? base.skip((page - 1) * count) : base);
  }
}
