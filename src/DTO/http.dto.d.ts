import { APIGatewayEvent } from "aws-lambda";

export interface BaseHTTPData {
  headers?: Object;
  body?: Object | string;
}

export interface CreateResInput extends BaseHTTPData {
  data?: Object | Object[] | string;
  statusCode?: number;
}

export interface ReturnResHTTPData {
  headers: Object;
  body: string;
  statusCode: number;
}

export interface APIGatewayEventIncludeConnectionName extends APIGatewayEvent {
  connectionName: string;
}
