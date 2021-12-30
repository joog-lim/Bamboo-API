import { createConnection } from "typeorm";
import { Algorithm, AlgorithmStatus, Emoji, Question, User } from "../entity";

export class DBMiddleware {
  static connectTypeOrm(_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value; // get function with a decorator on it.

    desc.value = async function (...args: any[]) {
      // argument override

      const connection = await createConnection({
        type: "mysql",
        url: process.env.DB_URL,
        entities: [User, Emoji, Algorithm, AlgorithmStatus, Question],
        logging: true,
        synchronize: false,
      });
      // run function
      const result = await originMethod.apply(this, args);

      if (result) {
        await connection.close();
      }

      return result;
    };
  }
}
