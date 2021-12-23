import { createConnection } from "typeorm";

export class DBMiddleware {
  static connectTypeOrm(_: any, __: string, desc: PropertyDescriptor) {
    const originMethod = desc.value; // get function with a decorator on it.

    desc.value = async function (...args: any[]) {
      // argument override

      const connection = await createConnection();
      // run function
      const result = await originMethod.apply(this, args);

      if (result) {
        await connection.close();
      }

      return result;
    };
  }
}
