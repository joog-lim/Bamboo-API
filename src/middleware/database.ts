import { createConnection, getConnectionManager } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../DTO/http.dto";
import * as Entity from "../entity";
import { Middleware } from "./type";

export const connectTypeOrm: Middleware = (method) => async (event) => {
  const connectionManager = getConnectionManager();
  let i = 0;
  for (; connectionManager.has(`connection${i}`); i++) {}
  const connection = await createConnection({
    name: `connection${i}`,
    type: "mysql",
    url: process.env.DB_URL,
    entities: Object.values(Entity),
    logging: false,
    synchronize: false,
    database: "bamboo",
    timezone: "+09:00",
  });
  event.connectionName = `connection${i}`;

  // run function
  const result = await method(event);

  if (result) {
    await connection.close();
  }

  return result;
};
