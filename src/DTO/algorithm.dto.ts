export interface BaseAlgorithmDTO {
  title: string;
  content: string;
  tag: string;
}

export type AlgorithmStatusType =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REPORTED";

export interface ModifyAlgorithmDTO extends BaseAlgorithmDTO {}
