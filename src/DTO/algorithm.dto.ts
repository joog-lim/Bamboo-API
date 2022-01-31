export interface BaseAlgorithmDTO {
  title: string;
  content: string;
  tag: string;
}

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
