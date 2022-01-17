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
  getAlgorithmListQuery({ status }: { status: AlgorithmStatusType }) {
    return this.createQueryBuilder("algorithm")
      .select([
        "algorithm.idx",
        "algorithm.algorithmNumber",
        "algorithm.title",
        "algorithm.content",
        "algorithm.tag",
        "algorithm.createdAt",
        "algorithm.reason",
      ])
      .leftJoinAndSelect("algorithm.emojis", "emoji")
      .where("algorithm.algorithmStatus = :status", {
        status,
      });
  }
  getList(
    { count, criteria, status }: JoinAlgorithmDTO,
    type: "cursor" | "page"
  ) {
    const base = this.getAlgorithmListQuery({ status });
    return this.addOrderAndTakeOptions(
      !!criteria ? this.listCriteria[type](base, criteria, count) : base,
      count
    );
  }

  listCriteria: { [key: string]: Function } = {
    cursor: (base: SelectQueryBuilder<Algorithm>, criteria: number) => {
      return base.andWhere("algorithm.algorithmNumber <= :cursor", {
        criteria,
      });
    },
    page: (
      base: SelectQueryBuilder<Algorithm>,
      criteria: number,
      count: number
    ) => {
      return base.skip((criteria - 1) * count);
    },
  };

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
  reportAlgorithm(id: number, reason: string) {
    return this.createQueryBuilder()
      .update(Algorithm)
      .set({ algorithmStatusStatus: "REPORTED", reason })
      .where("idx = :idx", { idx: id })
      .andWhere("algorithmStatus = :status", { status: "ACCEPTED" })
      .execute();
  }

  rejectOrAcceptAlgorithm(
    id: number,
    reason: string,
    status: AlgorithmStatusType
  ) {
    return this.createQueryBuilder()
      .update(Algorithm)
      .set({ algorithmStatusStatus: status, reason })
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

  async getBaseAlgorithmByIdx(idx: number) {
    return (await this.find({ where: { idx } }))[0];
  }
}
