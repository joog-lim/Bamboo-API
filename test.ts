import { createConnection } from "typeorm";

// connection settings are in the "ormconfig.json" file
createConnection()
  .then(async (connection) => {
    console.log("Success connect TypeOrm");

    await connection.close();
    console.log("Success disconnect TypeOrm");
  })
  .catch((error) => console.log("Error: ", error));
