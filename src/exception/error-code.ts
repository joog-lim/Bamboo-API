export type ErrorType = { message: string; status: number };

export const ERROR_CODE_LIST = {
  JL001: { message: "인가되지않은 Origin입니다.", status: 400 },
  JL002: { message: "어드민이 아닙니다.", status: 401 },
  JL003: { message: "인자값이 부족합니다.", status: 400 },
  JL004: {
    message: "예상치 못한 에러입니다. 개발자에게 문의해주세요.",
    status: 500,
  },
  JL005: { message: "Token 값을 찾을 수 없습니다.", status: 401 },
  JL006: { message: "Token 인증이 실패하였습니다.", status: 400 },
  JL007: { message: "잘못된 요청입니다.", status: 400 },
  JL008: { message: "액세스토큰이 유효하지않습니다.", status: 401 },
  JL009: { message: "리프레쉬토큰이 유효하지않습니다.", status: 400 },
  JL010: { message: "허용되지않은 값입니다.", status: 400 },
  JL011: { message: "비밀번호 또는 유저 인증에 실패하였습니다.", status: 401 },
  JL012: { message: "해당 알고리즘을 찾을 수 없습니다.", status: 404 },
  JL013: { message: "기한이 만료되었습니다.", status: 400 },
  JL014: { message: "해당 정보를 찾을 수 없습니다.", status: 404 },
  JL015: { message: "이미 처리된 이모지입니다.", status: 406 },
} as const;

export type ErrorCodeType = keyof typeof ERROR_CODE_LIST;
