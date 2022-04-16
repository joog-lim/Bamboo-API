export interface BaseAlgorithmDTO {
  title: string;
  content: string;
  tag: string;
}

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
