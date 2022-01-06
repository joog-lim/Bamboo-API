export interface BaseAlgorithmDTO {
  title: string;
  content: string;
  tag: string;
}

export interface GeneratedAlgorithmDTO extends BaseAlgorithmDTO {
  number: number;
}
export type AlgorithmStatusType =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REPORTED";

export interface JoinAlgorithmDTO {
  count: number;
  cursor?: number;
  page?: number;
  status: AlgorithmStatusType;
  isAdmin: boolean;
}

export type ModifyAlgorithmDTO = Partial<
  Pick<BaseAlgorithmDTO, "title" | "content">
>;
