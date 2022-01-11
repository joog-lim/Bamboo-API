import { createConnection, getConnectionManager } from "typeorm";
import { Algorithm, AlgorithmStatus, Emoji, Question, User } from "../entity";

export class DBMiddleware {
  static connectTypeOrm(_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value; // get function with a decorator on it.

    desc.value = async function (...args: any[]) {
      // argument override
      const connectionManager = getConnectionManager();
      let i = 0;
      for (; connectionManager.has(`connection${i}`); i++) {}
      console.log(i);
      console.log(process.env.DB_URL);
      const connection = await createConnection({
        name: `connection${i}`,
        type: "mysql",
        url: process.env.DB_URL,
        entities: [User, Emoji, Algorithm, AlgorithmStatus, Question],
        logging: true,
        synchronize: false,
        database: "bamboo",
      });
      args[0].connectionName = `connection${i}`;

      // run function
      const result = await originMethod.apply(this, args);

      if (result) {
        await connection.close();
      }

      return result;
    };
  }
}
