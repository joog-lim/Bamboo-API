import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AccessTokenDTO } from "../../../DTO/token.dto";
import { createRes } from "../../../util/http";
import { getAuthorizationByHeader, getBody } from "../../../util/req";
import { verifyToken } from "../../../util/token";

const modifyProfile = (event: APIGatewayEventIncludeConnectionName) => {
  const token = getAuthorizationByHeader(event.headers);
  const connectionName = event.connectionName;
  const { subId } = verifyToken(token) as AccessTokenDTO;
  const { number } = getBody<{ number: number }>(event.body);

  return createRes({});
};
export default modifyProfile;
