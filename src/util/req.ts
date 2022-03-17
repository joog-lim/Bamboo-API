import { APIGatewayProxyEventHeaders } from "aws-lambda";

export const getAuthorizationByHeader: Function = (
  header: APIGatewayProxyEventHeaders,
): string | "" => header.authorization || header.Authorization || "";

export function getBody<T>(body: string | null): T {
  return JSON.parse(body || "{}");
}
