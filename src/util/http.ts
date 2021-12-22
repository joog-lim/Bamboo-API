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

export const ERROR_CODE: { [key: string]: string } = {
  JL001: "인가되지않은 Origin입니다.",
  JL002: "어드민이 아닙니다.",
  JL003: "인자값이 부족합니다.",
  JL004: "예상치 못한 에러입니다. 개발자에게 문의해주세요.",
} as const;

export type ErrorCodeType = typeof ERROR_CODE[keyof typeof ERROR_CODE];

export const createRes = ({
  statusCode,
  headers,
  body,
}: CreateResInput): ReturnResHTTPData => {
  return {
    statusCode: statusCode ?? 200,
    headers: Object.assign(
      {},
      {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      headers ?? {}
    ),
    body: JSON.stringify(body ?? {}),
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
      message: ERROR_CODE[errorCode],
    }),
  };
};

