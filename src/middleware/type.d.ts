import { APIGatewayEventIncludeConnectionName } from "../DTO/http.dto";
import { APIFunction } from "../util/serverless";

type Event = APIGatewayEventIncludeConnectionName;

export type Middleware = (method: APIFunction) => APIFunction;
