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
  async getBaseAlgorithmByIdx(idx: number): Promise<Algorithm | undefined> {
    return (await this.find({ where: { idx } }))[0];
  }

  async getIdxByNumber(number: number): Promise<number | undefined> {
    return (await this.getBaseAlgorithmByIdx(number))?.idx;
  }

  async getLastAlgorithmNumber(status: AlgorithmStatusType): Promise<number> {
    return (
      (
        await this.find({
          where: { algorithmStatus: { status } },
          order: { algorithmNumber: "DESC" },
          take: 1,
        })
      )[0]?.algorithmNumber ?? 1
    );
  }

  getIsClickedEmojiAtAlgorithmByUser(
    [firstNumber, lastNumber]: [number, number],
    userSubId: string,
    status: AlgorithmStatusType,
  ): Promise<Algorithm[]> {
    const statusWhereQuery = `(algorithm.algorithmStatus = :status ${
      status === "ACCEPTED" ? "OR algorithm.algorithmStatus = :orStatus" : ""
    })`;

    return this.createQueryBuilder("algorithm")
      .innerJoin("emoji", "emoji", "algorithm.idx = emoji.algorithmIdx")
      .where("emoji.userSubId = :userSubId", { userSubId })
      .andWhere(
        "algorithm.algorithmNumber between :lastNumber and :firstNumber",
        { lastNumber, firstNumber }, // 알고리즘을 DESC로 받기에 first가 숫자가 더 큼
      )
      .andWhere(statusWhereQuery, {
        status,
        orStatus: "REPORTED",
      })
      .orderBy("algorithmNumber", "DESC")
      .getMany();
  }

  getList(
    { count, criteria, status }: JoinAlgorithmDTO,
    type: AlgorithmListType,
  ): Promise<Algorithm[]> {
    const base = this._getAlgorithmListQuery({ status });
    return this._addOrderAndTakeOptions(
      !!criteria ? this._listCriteria[type](base, criteria, count) : base,
      count,
    );
  }

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

  /**
   * @param {number} idx
   * @param {string} reason
   * @param {"REJECTED" | "ACCEPTED" | "REPORTED"} status
   * @returns {Promise<UpdateResult>}
   */
  async setAlgorithmStatus(
    idx: number,
    reason: string,
    status: AlgorithmStatusType,
  ): Promise<UpdateResult> {
    return this.createQueryBuilder()
      .update(Algorithm)
      .set({
        algorithmStatusStatus: status,
        reason,
        ...(status === "REPORTED"
          ? {}
          : {
              algorithmNumber: (await this.getLastAlgorithmNumber(status)) + 1,
            }),
      })
      .where("idx = :idx", { idx })
      .andWhere("algorithmStatus = :status", { status })
      .execute();
  }

  _addOrderAndTakeOptions(
    algorithmList: SelectQueryBuilder<Algorithm>,
    count: number,
  ): Promise<Algorithm[]> {
    return algorithmList
      .take(count)
      .orderBy("algorithm.algorithmNumber", "DESC")
      .getMany();
  }

  _getAlgorithmListQuery({
    status,
  }: {
    status: AlgorithmStatusType;
  }): SelectQueryBuilder<Algorithm> {
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
      .where(
        `(algorithm.algorithmStatus = :status1 OR ${
          status === "ACCEPTED" ? "algorithm.algorithmStatus = :status2" : ""
        })`,
        {
          ...{ status1: status },
          ...(status === "ACCEPTED" ? { status2: "REPORTED" } : {}),
        },
      );
  }

  _listCriteria: {
    [key in AlgorithmListType]: (
      base: SelectQueryBuilder<Algorithm>,
      criteria: number,
      count: number,
    ) => SelectQueryBuilder<Algorithm>;
  } = {
    cursor: (base: SelectQueryBuilder<Algorithm>, criteria: number) => {
      return criteria === 0
        ? base
        : base.andWhere("algorithm.algorithmNumber < :criteria", {
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
}
