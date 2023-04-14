import express, { Express } from "express";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

import { MongoService } from "./mongo_service/service";
import { Handler } from "./handler/handler";

dotenv.config({ path: path.resolve(__dirname, './.env') });

const port: number = parseInt(process.env.PORT as string) || 4000;
const uri: string = process.env.MONGO_URI as string || "mongodb://localhost:27017/check-asset";

const mongoService = new MongoService(new MongoClient(uri));
const handler = new Handler(mongoService);

const app: Express = express();
app.use(express.json());

app.post("/add", handler.addNewAsset());
app.get("/assets", handler.getAssets());
app.get("/types", handler.getTypes());

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});