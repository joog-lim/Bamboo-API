import { CreateResInput, ReturnResHTTPData } from "../DTO/http.dto";

export const ALLOWED_ORIGINS: string[] = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost",
  "https://localhost",
  "https://joog-lim.info",
  "https://www.joog-lim.info",
  "https://jooglim.netlify.app",
];

export const ERROR_CODE_LIST = {
  JL001: "인가되지않은 Origin입니다.",
  JL002: "어드민이 아닙니다.",
  JL003: "인자값이 부족합니다.",
  JL004: "예상치 못한 에러입니다. 개발자에게 문의해주세요.",
  JL005: "Token 값을 찾을수 없습니다.",
  JL006: "Token 인증이 실패하였습니다.",
  JL007: "잘못된 요청입니다.",
  JL008: "액세스토큰이 유효하지않습니다.",
  JL009: "리프레쉬토큰이 유효하지않습니다.",
  JL010: "허용되지않은 값입니다.",
  JL011: "비밀번호 또는 유저 인증에 실패하였습니다.",
  JL012: "해당 알고리즘을 찾을 수 없습니다.",
  JL013: "기한이 만료되었습니다.",
  JL014: "해당 정보를 찾을 수 없습니다.",
} as const;

export type ErrorCodeType = keyof typeof ERROR_CODE_LIST;

export const createRes = ({
  statusCode,
  headers,
  data,
}: CreateResInput): ReturnResHTTPData => {
  return {
    statusCode: statusCode ?? 200,
    headers: Object.assign(
      {},
      {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      headers ?? {},
    ),
    body: JSON.stringify({
      success: true,
      code: "JL000",
      message: "요청이 성공적으로 이루어졌습니다.",
      data,
    }),
  };
};
export const createErrorRes = ({
  errorCode,
  status,
}: {
  errorCode: ErrorCodeType;
  status?: number;
}): ReturnResHTTPData => {
  return {
    statusCode: status ?? 400,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      success: false,
      errorCode: errorCode,
      message: ERROR_CODE_LIST[errorCode],
    }),
  };
};
