import { APIGatewayEvent } from "aws-lambda";

export const baseRequest: APIGatewayEvent = {
  body: "",
  headers: { Origin: "https://joog-lim.info" },
  multiValueHeaders: undefined,
  httpMethod: "",
  isBase64Encoded: false,
  path: "",
  pathParameters: undefined,
  queryStringParameters: undefined,
  multiValueQueryStringParameters: undefined,
  stageVariables: undefined,
  requestContext: undefined,
  resource: "",
};
