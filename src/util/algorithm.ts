import { filter, first, map, pipe, toArray } from "@fxts/core";
import { report } from "process";
import { getCustomRepository } from "typeorm";
import {
  AlgorithmListType,
  AlgorithmStatusType,
  JoinAlgorithmDTO,
} from "../DTO/algorithm.dto";
import { Algorithm, ReportAlgorithm } from "../entity";
import { ReportAlgorithmRepository } from "../repository";
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
        nextCursor: algorithmList[algorithmList.length - 1]?.algorithmNumber,
      }
    : {}),
});

export const algorithmListMergeReportAndEmojiList: Function = async (
  algorithmList: Algorithm[],
  isClickedByUser: Algorithm[],
  reportAlgorithm: ReportAlgorithm[],
): Promise<Algorithm[]> => {
  const emojiSet = new Set(
    await toArray(map((a: Algorithm) => a.idx, isClickedByUser)),
  );
  const reportSet = new Set(
    await toArray(
      map((a: ReportAlgorithm) => a.algorithm.idx, reportAlgorithm),
    ),
  );

  return pipe(
    algorithmList,
    filter((alg) => !reportSet.has(alg.idx)),
    map((alg) => ({
      ...alg,
      emojiCount: alg.emojis.length,
      isClicked: emojiSet.has(alg.idx),
    })),
    toArray,
  );
};

export const getAlgorithmList: Function = async (
  connectionName: string,
  condition: JoinAlgorithmDTO,
  sub: string,
  type: AlgorithmListType,
): Promise<Algorithm[]> => {
  const algorithmRepo = getCustomRepository(
    AlgorithmRepository,
    connectionName,
  );

  const algorithmList = await algorithmRepo.getList(condition, type);

  const algorithmCount = algorithmList.length;
  if (algorithmCount === 0) {
    return [];
  }

  const firstAlgorithm = algorithmList[0];
  const lastAlgorithm = algorithmList[algorithmCount - 1];

  const reportAlgorithmList = await getCustomRepository(
    ReportAlgorithmRepository,
    connectionName,
  ).getReportAlgorithmIdxList(sub, [
    firstAlgorithm.idx || 0,
    lastAlgorithm.idx || 0,
  ]);
  const isClickedByUser =
    await algorithmRepo.getIsClickedEmojiAtAlgorithmByUser(
      [firstAlgorithm.algorithmNumber || 0, lastAlgorithm.algorithmNumber || 0],
      sub,
      condition.status,
    );

  return algorithmListMergeReportAndEmojiList(
    algorithmList,
    isClickedByUser,
    reportAlgorithmList,
  );
};
