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
  directionType,
  JoinAlgorithmDTO,
  ModifyAlgorithmDTO,
  sortByType,
} from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";

@EntityRepository(Algorithm)
export class AlgorithmRepository extends Repository<Algorithm> {
  getBaseAlgorithmByIdx(idx: number): Promise<Algorithm | undefined> {
    return this.findOne(idx);
  }

  async getIdxByNumber(number: number): Promise<number | undefined> {
    return (await this.getBaseAlgorithmByIdx(number))?.idx;
  }

  getAlgorithmByIdx(idx: string): Promise<Algorithm | undefined> {
    return this.findOne(idx, {
      join: {
        alias: "algorithm",
        leftJoinAndSelect: {
          emoji: "algorithm.emojis",
        },
      },
    });
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
    { count, criteria, status, direction, sort }: JoinAlgorithmDTO,
    type: AlgorithmListType,
  ): Promise<Algorithm[]> {
    const base = this._getAlgorithmListQuery({ status });
    return this._addOrderAndTakeOptions(
      !!criteria
        ? this._listCriteria[type](base, criteria, { count, direction })
        : base,
      count,
      { direction, sort },
    ).getMany();
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
    { direction, sort }: { direction: directionType; sort: sortByType },
  ): SelectQueryBuilder<Algorithm> {
    const base = algorithmList.take(count);
    return sort === "created"
      ? base.orderBy("algorithm.algorithmNumber", direction)
      : base
          .orderBy(`emojiCount`, direction)
          .addOrderBy("algorithm.algorithmNumber", "DESC");
  }

  _getAlgorithmListQuery({
    status,
  }: {
    status: AlgorithmStatusType;
  }): SelectQueryBuilder<Algorithm> {
    return this.createQueryBuilder("algorithm")
      .leftJoinAndSelect("algorithm.emojis", "emoji")
      .addSelect("count(emoji.algorithmIdx)", "emojiCount")
      .where(
        `(algorithm.algorithmStatus = :status1${
          status === "ACCEPTED"
            ? " OR algorithm.algorithmStatus = :status2"
            : ""
        })`,
        {
          ...{ status1: status },
          ...(status === "ACCEPTED" ? { status2: "REPORTED" } : {}),
        },
      )
      .groupBy("algorithm.idx")
      .addGroupBy("algorithm.algorithmNumber")
      .addGroupBy("emoji.idx");
  }

  _listCriteria: {
    [key in AlgorithmListType]: (
      base: SelectQueryBuilder<Algorithm>,
      criteria: number,
      { count, direction }: { count: number; direction: directionType },
    ) => SelectQueryBuilder<Algorithm>;
  } = {
    cursor: (base, criteria, { direction }) => {
      return criteria === 0
        ? base
        : base.andWhere(
            `algorithm.algorithmNumber ${
              direction === "DESC" ? "<" : ">"
            } :criteria`,
            {
              criteria,
            },
          );
    },
    page: (base, criteria, { count }) => {
      return base.skip(((criteria || 1) - 1) * count);
    },
  };
}
