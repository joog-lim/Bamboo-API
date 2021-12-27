import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";

import { JoinAlgorithmDTO, ModifyAlgorithmDTO } from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";

@EntityRepository(Algorithm)
export class AlgorithmRepository extends Repository<Algorithm> {
  getListByCursor({ count, cursor, status, isAdmin }: JoinAlgorithmDTO) {
    function addOptions(algorithmList: SelectQueryBuilder<Algorithm>) {
      return algorithmList
        .take(count)
        .orderBy("algorithmNumber", "DESC")
        .getMany();
    }

    const base = this.createQueryBuilder("algorithm")
      .select([
        "algorithm.idx",
        "algorithm.algorithmNumber as algorithmNumber",
        "algorithm.title as title",
        "algorithm.content as content",
        "algorithm.tag as tag",
        "algorithm.createdAt as createdAt",
        "count(emoji.idx) as emojis",
        "algorithm.algorithmStatus as algorithmStatus",
      ])
      .leftJoin("emoji", "emoji", "algorithm.idx = emoji.algorithemIdx")
      .where("algorithm.algorithmStatus = :status", {
        status: isAdmin ? status : "PENDING",
      });

    return addOptions(
      !!cursor
        ? base.andWhere("algorithm.algorithmNumber <= :cursor", { cursor })
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

  getAlgorithmCountAtAll() {
    return this.createQueryBuilder("algorithm")
      .select("algorithm.algorithmStatus AS status")
      .addSelect("COUNT(*) AS count")
      .groupBy("algorithm.algorithmStatus")
      .getRawMany();
  }

  modifyAlgorithm(id: number, data: ModifyAlgorithmDTO) {
    return this.update(id, data);
  }

  deleteAlgorithm(id: number) {
    return this.delete(id);
  }

  async getIdxByNumber(number: number): Promise<number> {
    return (await this.find({ algorithmNumber: number }))[0]?.idx;
  }
}
