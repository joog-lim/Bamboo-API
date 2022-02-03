import {
  DeleteResult,
  EntityRepository,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from "typeorm";

import {
  AlgorithmListType,
  AlgorithmStatusType,
  JoinAlgorithmDTO,
  ModifyAlgorithmDTO,
} from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";

@EntityRepository(Algorithm)
export class AlgorithmRepository extends Repository<Algorithm> {
  addOrderAndTakeOptions(
    algorithmList: SelectQueryBuilder<Algorithm>,
    count: number,
  ): Promise<Algorithm[]> {
    return algorithmList
      .take(count)
      .orderBy("algorithm.algorithmNumber", "DESC")
      .getMany();
  }
  getAlgorithmListQuery({
    status,
  }: {
    status: AlgorithmStatusType;
  }): SelectQueryBuilder<Algorithm> {
    const base = this.createQueryBuilder("algorithm")
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
      .where("algorithm.algorithmStatus = :status1", {
        status1: status,
      });
    return status === "ACCEPTED"
      ? base.orWhere("algorithm.algorithmStatus = :status2", {
          status2: "REPORTED",
        })
      : base;
  }
  getList(
    { count, criteria, status }: JoinAlgorithmDTO,
    type: AlgorithmListType,
  ): Promise<Algorithm[]> {
    const base = this.getAlgorithmListQuery({ status });
    return this.addOrderAndTakeOptions(
      !!criteria ? this.listCriteria[type](base, criteria, count) : base,
      count,
    );
  }

  listCriteria: {
    [key in AlgorithmListType]: (
      base: SelectQueryBuilder<Algorithm>,
      criteria: number,
      count: number,
    ) => SelectQueryBuilder<Algorithm>;
  } = {
    cursor: (base: SelectQueryBuilder<Algorithm>, criteria: number) => {
      return criteria === 0
        ? base
        : base.andWhere("algorithm.algorithmNumber <= :criteria", {
            criteria,
          });
    },
    page: (
      base: SelectQueryBuilder<Algorithm>,
      criteria: number,
      count: number,
    ) => {
      return base.skip(((criteria || 1) - 1) * count);
    },
  };

  getAlgorithmCountAtAll() {
    return this.createQueryBuilder("algorithm")
      .select("algorithm.algorithmStatus AS status")
      .addSelect("COUNT(*) AS count")
      .groupBy("algorithm.algorithmStatus")
      .getRawMany();
  }

  modifyAlgorithm(id: number, data: ModifyAlgorithmDTO): Promise<UpdateResult> {
    return this.update(id, data);
  }

  deleteAlgorithm(id: number): Promise<DeleteResult> {
    return this.delete(id);
  }

  reportAlgorithm(id: number, reason: string): Promise<UpdateResult> {
    return this.createQueryBuilder()
      .update(Algorithm)
      .set({ algorithmStatusStatus: "REPORTED", reason })
      .where("idx = :idx", { idx: id })
      .andWhere("algorithmStatus = :status", { status: "ACCEPTED" })
      .execute();
  }

  async rejectOrAcceptAlgorithm(
    id: number,
    reason: string,
    status: AlgorithmStatusType,
  ): Promise<UpdateResult> {
    return this.createQueryBuilder()
      .update(Algorithm)
      .set({
        algorithmStatusStatus: status,
        reason,
        algorithmNumber: (await this.getLastAlgorithmNumber(status)) + 1,
      })
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
    status: AlgorithmStatusType,
  ): Promise<Algorithm[]> {
    const baseQuery = this.createQueryBuilder("algorithm")
      .innerJoin("emoji", "emoji", "algorithm.idx = emoji.algorithmIdx")

      .where("emoji.userSubId = :userSubId", { userSubId })
      .andWhere(
        "algorithm.algorithmNumber between :lastNumber and :firstNumber",
        { lastNumber, firstNumber },
      )
      .andWhere("algorithm.algorithmStatus = :status", { status });

    const query =
      status === "ACCEPTED"
        ? baseQuery.orWhere("algorithm.algorithmStatus = :orStatus", {
            orStatus: "REPORTED",
          })
        : baseQuery;
    return query.orderBy("algorithmNumber", "DESC").getMany();
  }

  async getBaseAlgorithmByIdx(idx: number): Promise<Algorithm> {
    return (await this.find({ where: { idx } }))[0];
  }

  async getLastAlgorithmNumber(status: AlgorithmStatusType): Promise<number> {
    return (
      await this.find({
        where: { algorithmStatus: { status } },
        order: { algorithmNumber: "DESC" },
        take: 1,
      })
    )[0]?.algorithmNumber;
  }
}
