import { APIGatewayEvent } from "aws-lambda";

export const baseRequest : APIGatewayEvent = {
    body: "",
    headers: {},
    multiValueHeaders: undefined,
    httpMethod: "",
    isBase64Encoded: false,
    path: "",
    pathParameters: undefined,
    queryStringParameters: undefined,
    multiValueQueryStringParameters: undefined,
    stageVariables: undefined,
    requestContext: undefined,
    resource: ""
}