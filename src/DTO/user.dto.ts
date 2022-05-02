export interface SignUpDataDTO extends StdInformation {
  email: string;
  nickname: string;
  stdGrade: number;
  stdClass: number;
  stdNumber: number;
  pw: string;
}

export interface AuthEmailArgDTO {
  email: string;
  number: string;
}

export interface SignInDataDTO {
  email: string;
  pw: string;
}

export interface StdInformation {
  stdGrade: number;
  stdClass: number;
  stdNumber: number;
}
