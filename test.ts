import { createConnection } from "typeorm";

// connection settings are in the "ormconfig.json" file
createConnection()
  .then(async (connection) => {
    console.log(connection);
  })
  .catch((error) => console.log("Error: ", error));
