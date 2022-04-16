import { APIGatewayProxyEventHeaders } from "aws-lambda";

export const getAuthorizationByHeader: Function = (
  header: APIGatewayProxyEventHeaders,
): string | undefined =>
  header.authorization || header.Authorization || undefined;

export const getBody = <T extends Object>(body: string | null): T =>
  JSON.parse(body || "{}");
