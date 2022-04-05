import { map, pipe, toArray } from "@fxts/core";
import { getCustomRepository } from "typeorm";
import {
  AlgorithmListType,
  AlgorithmStatusType,
  JoinAlgorithmDTO,
} from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";
import { AlgorithmRepository } from "../repository/algorithm";

export const generateAlgorithmListResponse: Function = ({
  algorithmList,
  status,
  count,
  type,
}: {
  algorithmList: Algorithm[];
  status: AlgorithmStatusType;
  count: number;
  type: AlgorithmListType;
}) => ({
  data: algorithmList,
  status,
  ...(type == "cursor"
    ? {
        hasNext: algorithmList.length == Number(count),
        nextCursor: algorithmList[algorithmList.length - 1].algorithmNumber,
      }
    : {}),
});

export const algorithmListMergeEmojiList: Function = async (
  algorithmList: Algorithm[],
  isClickedByUser: Algorithm[],
): Promise<Algorithm[]> => {
  const set = new Set(
    await toArray(map((a: Algorithm) => a.idx, isClickedByUser)),
  );
  return pipe(
    algorithmList,
    map((alg) => ({
      ...alg,
      emojiCount: alg.emojis.length,
      isClicked: set.has(alg.idx),
    })),
    toArray,
  );
};

export const getAlgorithmList: Function = async (
  connectionName: string,
  { count, criteria, status }: JoinAlgorithmDTO,
  sub: string,
  type: "cursor" | "page",
): Promise<Algorithm[]> => {
  const algorithmRepo = getCustomRepository(
    AlgorithmRepository,
    connectionName,
  );
  const algorithmList = await algorithmRepo.getList(
    {
      count,
      criteria,
      status,
    },
    type,
  );

  const algorithmCount = algorithmList.length;
  if (algorithmCount === 0) {
    return [];
  }

  const firstNumber = algorithmList[0].algorithmNumber || 0;
  const lastNumber = algorithmList[algorithmCount - 1].algorithmNumber || 0;

  const isClickedByUser = await algorithmRepo.getIsClickedAlgorithmByUser(
    firstNumber,
    lastNumber,
    sub,
    status,
  );

  return algorithmListMergeEmojiList(algorithmList, isClickedByUser);
};
