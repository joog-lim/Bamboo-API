import { getCustomRepository, getRepository } from "typeorm";
import { AlgorithmStatusType, JoinAlgorithmDTO } from "../DTO/algorithm.dto";
import { Algorithm } from "../entity";
import { AlgorithmRepository } from "../repository/algorithm";

export const getLastPostNumber: Function = async (
  status: AlgorithmStatusType,
  connectionName: string
) => {
  return (
    (
      await getRepository(Algorithm, connectionName).find({
        where: { algorithmStatus: { status } },
        order: { algorithmNumber: "DESC" },
        take: 1,
      })
    )[0]?.algorithmNumber ?? 1
  );
};

export const algorithmListMergeEmojiList: Function = (
  algorithmList: Algorithm[],
  isClickedByUser: Algorithm[]
): Algorithm[] => {
  for (let i = 0, j = 0; i < algorithmList.length; i++) {
    const isClicked = isClickedByUser[j]?.idx === algorithmList[i].idx;
    isClicked && j++;

    algorithmList[i] = Object.assign(
      {},
      algorithmList[i],
      isClicked ? { isClicked: true } : { isClicked: false },
      { emojiCount: algorithmList[i].emojis.length }
    );
  }
  return algorithmList;
};

export const getAlgorithmList: Function = async (
  connectionName: string,
  { count, criteria, status }: JoinAlgorithmDTO,
  sub: string,
  type: "cursor" | "page"
): Promise<Algorithm[]> => {
  const algorithmRepo = getCustomRepository(
    AlgorithmRepository,
    connectionName
  );
  const algorithmList = await algorithmRepo.getList(
    {
      count,
      criteria,
      status,
    },
    type
  );

  const algorithmCount = algorithmList.length;
  if (algorithmCount === 0) {
    return [];
  }

  const firstNumber = algorithmList[0].algorithmNumber;
  const lastNumber = algorithmList[algorithmCount - 1].algorithmNumber;

  const isClickedByUser = await algorithmRepo.getIsClickedAlgorithmByUser(
    firstNumber,
    lastNumber,
    sub,
    status
  );
  return algorithmListMergeEmojiList(algorithmList, isClickedByUser);
};
