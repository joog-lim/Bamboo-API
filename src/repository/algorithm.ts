import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";

import {
  AlgorithmStatusType,
  JoinAlgorithmDTO,
  ModifyAlgorithmDTO,
} from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";

@EntityRepository(Algorithm)
export class AlgorithmRepository extends Repository<Algorithm> {
  addOrderAndTakeOptions(
    algorithmList: SelectQueryBuilder<Algorithm>,
    count: number
  ) {
    return algorithmList
      .take(count)
      .orderBy("algorithm.algorithmNumber", "DESC")
      .getMany();
  }
  getAlgorithmListQuery({
    isAdmin,
    status,
  }: {
    isAdmin: boolean;
    status: AlgorithmStatusType;
  }) {
    return this.createQueryBuilder("algorithm")
      .select([
        "algorithm.idx",
        "algorithm.algorithmNumber",
        "algorithm.title",
        "algorithm.content",
        "algorithm.tag",
        "algorithm.createdAt",
      ])
      .leftJoinAndSelect("algorithm.emojis", "emoji")
      .where("algorithm.algorithmStatus = :status", {
        status: isAdmin ? status : "ACCEPTED",
      })
      .groupBy("algorithm.algorithmNumber");
  }
  getListByCursor({ count, cursor, status, isAdmin }: JoinAlgorithmDTO) {
    const base = this.getAlgorithmListQuery({ status, isAdmin });
    return this.addOrderAndTakeOptions(
      !!cursor
        ? base.andWhere("algorithm.algorithmNumber <= :cursor", { cursor })
        : base,
      count
    );
  }

  getListByPage({ count, page, status, isAdmin }: JoinAlgorithmDTO) {
    const base = this.getAlgorithmListQuery({ status, isAdmin });
    return this.addOrderAndTakeOptions(
      !!page ? base.skip((page - 1) * count) : base,
      count
    );
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
  reportAlgorithm(id: number) {
    return this.createQueryBuilder()
      .update(Algorithm)
      .set({ algorithmStatusStatus: "REPORTED" })
      .where("idx = :idx", { idx: id })
      .andWhere("algorithmStatus = :status", { status: "ACCEPTED" })
      .execute();
  }

  rejectOrAcceptAlgorithm(id: number, status: AlgorithmStatusType) {
    return this.createQueryBuilder()
      .update(Algorithm)
      .set({ algorithmStatusStatus: status })
      .where("idx = :idx", { idx: id })
      .andWhere("algorithmStatus = :status", { status: "PENDING" })
      .execute();
  }

  async getIdxByNumber(number: number): Promise<number> {
    return (await this.find({ algorithmNumber: number }))[0]?.idx;
  }

  getIsClickedAlgorithmByUser(
    firstNumber: number,
    lastNumber: number,
    userSubId: string,
    status: AlgorithmStatusType
  ) {
    return this.createQueryBuilder("algorithm")
      .innerJoin("emoji", "emoji", "algorithm.idx = emoji.algorithmIdx")

      .where("emoji.userSubId = :userSubId", { userSubId })
      .andWhere(
        "algorithm.algorithmNumber between :lastNumber and :firstNumber",
        { lastNumber, firstNumber }
      )
      .andWhere("algorithm.algorithmStatus = :status", { status })
      .orderBy("algorithmNumber", "DESC")
      .getMany();
  }
}
