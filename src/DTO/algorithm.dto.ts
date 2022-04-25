export interface BaseAlgorithmDTO {
  title: string;
  content: string;
  tag: string;
}

export type directionType = "ASC" | "DESC";
export type sortByType = "created" | "leaf";

export interface CheckVerifyDTO {
  [key: string]: any;
  verify?: { answer: string; id: string };
}

export type WriteAlgorithmArgumentDTO = CheckVerifyDTO & BaseAlgorithmDTO;

export interface GeneratedAlgorithmDTO extends BaseAlgorithmDTO {
  algorithmNumber: number;
}

export type AlgorithmStatusType =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REPORTED";

export interface JoinAlgorithmDTO {
  count: number;
  criteria: number;
  status: AlgorithmStatusType;
  sort: sortByType;
  direction: directionType;
}

export type ModifyAlgorithmDTO = Partial<Omit<BaseAlgorithmDTO, "tag">>;

export type AlgorithmListType = "page" | "cursor";

export interface SetStatusAlgorithmDTO {
  status: AlgorithmStatusType;
  reason?: string;
}

export interface CheckAlgorithmNumber {
  [key: string]: string | number;
  number: number;
}
