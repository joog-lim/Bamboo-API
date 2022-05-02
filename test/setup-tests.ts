import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { ADMIN_JWT } from "./config";
console.log(ADMIN_JWT);
