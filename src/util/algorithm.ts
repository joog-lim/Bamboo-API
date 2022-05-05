import { filter, map, pipe, toArray } from "@fxts/core";
import { getCustomRepository } from "typeorm";
import { AlgorithmListType, JoinAlgorithmDTO } from "../DTO/algorithm.dto";
import { Algorithm, ReportAlgorithm } from "../entity";
import { ReportAlgorithmRepository } from "../repository";
import { AlgorithmRepository } from "../repository/algorithm";

const toArrayMap =
  (f: (value: any, index: number, array: any[]) => unknown) => (arr: any[]) =>
    arr.map(f);

const withOutReport = (reportAlgorithm: ReportAlgorithm[]) => {
  const reportSet = new Set(
    toArrayMap((a: ReportAlgorithm) => a.algorithm.idx)(reportAlgorithm),
  );

  return (alg: Algorithm) => !reportSet.has(alg.idx);
};

const mergeIsCliked = (isClickedByUser: Algorithm[]) => {
  const isClikedSet = new Set(
    toArrayMap((a: Algorithm) => a.idx)(isClickedByUser),
  );

  return (alg: Algorithm) => ({
    ...alg,
    emojiCount: alg.emojis.length,
    isClicked: isClikedSet.has(alg.idx),
  });
};

export const generateAlgorithmListResponse: Function = ({
  algorithmList,
  condition,
  type,
}: {
  algorithmList: Algorithm[];
  condition: Omit<JoinAlgorithmDTO, "criteria">;
  type: AlgorithmListType;
}) => ({
  data: algorithmList,
  status: condition.status,
  ...(type == "cursor"
    ? {
        hasNext: algorithmList.length === condition.count,
        nextCursor: algorithmList[algorithmList.length - 1]?.algorithmNumber,
      }
    : {}),
});

export const getAlgorithmList: Function = (type: AlgorithmListType) => {
  return async (
    connectionName: string,
    condition: JoinAlgorithmDTO,
    sub: string,
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
        [
          firstAlgorithm.algorithmNumber || 0,
          lastAlgorithm.algorithmNumber || 0,
        ],
        sub,
        condition.status,
      );

    return pipe(
      algorithmList,
      filter(withOutReport(reportAlgorithmList)),
      map(mergeIsCliked(isClickedByUser)),
      toArray,
    );
  };
};
