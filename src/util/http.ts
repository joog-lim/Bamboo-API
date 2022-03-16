import { CreateResInput, ReturnResHTTPData } from "../DTO/http.dto";
import { ErrorCodeType, ERROR_CODE_LIST } from "../exception";

export const ALLOWED_ORIGINS: string[] = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost",
  "https://localhost",
  "https://joog-lim.info",
  "https://www.joog-lim.info",
  "https://jooglim.netlify.app",
];

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
