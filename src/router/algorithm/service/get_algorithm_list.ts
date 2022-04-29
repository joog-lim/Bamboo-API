import {
  AlgorithmStatusType,
  JoinAlgorithmDTO,
} from "../../../DTO/algorithm.dto";
import {
  APIGatewayEventIncludeConnectionName,
  ReturnResHTTPData,
} from "../../../DTO/http.dto";
import { HttpException } from "../../../exception";
import {
  generateAlgorithmListResponse,
  getAlgorithmList,
} from "../../../util/algorithm";
import { createRes } from "../../../util/http";
import { isNumeric } from "../../../util/number";
import { getAuthorizationByHeader } from "../../../util/req";
import { verifyToken } from "../../../util/token";

const getAlgorithmLists = (
  target: "user" | "admin",
): ((
  event: APIGatewayEventIncludeConnectionName,
) => Promise<ReturnResHTTPData>) => {
  return async (event: APIGatewayEventIncludeConnectionName) => {
    const param = {
      count: "10",
      criteria: "0", // setting default value
      direction: "DESC",
      sort: "created",
      status: "ACCEPTED",
      ...event.queryStringParameters,
    };

    if (!isNumeric(param.count) || !isNumeric(param.criteria)) {
      throw new HttpException("JL007");
    }

    const status: AlgorithmStatusType =
      target === "admin" ? (param.status as AlgorithmStatusType) : "ACCEPTED";
    const sort = param.sort === "leaf" ? "leaf" : "created";
    const direction = param.direction === "DESC" ? "DESC" : "ASC";
    const condition: JoinAlgorithmDTO = {
      count: Number(param.count),
      criteria: Number(param.criteria),
      status,
      sort,
      direction,
    };

    const type = event.pathParameters?.type ?? "cursor";

    const user = verifyToken(getAuthorizationByHeader(event.headers));

    const algorithmList: Algorithm[] = await getAlgorithmList(type)(
      event.connectionName,
      condition,
      user?.subId,
    );

    const data = generateAlgorithmListResponse({
      algorithmList,
      condition: { status, count: condition.count },
      type,
    });

    return createRes({
      data,
    });
  };
};

export default getAlgorithmLists;
