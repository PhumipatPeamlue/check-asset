import { MongoClient, Db, Collection, InsertOneResult } from "mongodb"

import { AssetInterface } from "../models/asset"
import { TypeInterface } from "../models/type"
import { PageOptType } from "../models/pageOpt"
import { query } from "express"

interface MongoServiceInterface {
  connect(dbName: string, colName: string): Promise<{ db: Db, collection: Collection }>
  insertAsset(doc: AssetInterface): Promise<void>
  insertType(doc: TypeInterface): Promise<void>
  findAssets(pageOpt: PageOptType): Promise<{ docs: AssetInterface[], count_docs: number }>
  findTypes(): Promise<string[]>
}

class MongoService implements MongoServiceInterface {
  private client: MongoClient

  constructor(c: MongoClient) {
    this.client = c;
  }

  async connect(dbName: string, colName: string): Promise<{ db: Db, collection: Collection }> {
    await this.client.connect();
    const db = this.client.db(dbName);
    const collection = db.collection(colName);
    return { db, collection }
  }

  async insertAsset(doc: AssetInterface): Promise<void> {
    let { collection } = await this.connect("check-asset", "hardware-asset");
    const result: InsertOneResult = await collection.insertOne(doc);
    console.log(`Inserted document with id ${result.insertedId}`);
  }

  async insertType(doc: TypeInterface): Promise<void> {    
    let { collection } = await this.connect("check-asset", "types");
    const findResult = await collection.findOne({ name: doc.name });
    
    if (findResult === null) {
      await collection.insertOne(doc);
      console.log(`add new type (${doc.name}) to db`);
    } else {
      console.log(`This type (${doc.name}) is already add to db.`);
    }
  }

  async findAssets(pageOpt: PageOptType): Promise<{ docs: AssetInterface[], count_docs: number }> {
    const { page, pageSize, type, sort, search } = pageOpt;
    const { collection } = await this.connect("check-asset", "hardware-asset");
    
    let docs: AssetInterface[], count_docs: number;
    const skip = (page - 1) * pageSize;

    if (search === undefined || search === "") {
      const query: { Type: string } = { Type: type };
      count_docs = await collection.countDocuments(query);
      docs = await collection.find(query).sort({ [sort]: 1 }).skip(skip).limit(pageSize).toArray();
    } else {
      const regexPatten = new RegExp(`^${search}`, "i");
      const query = {
        Type: type,
        $or: [
          { AssetNo: { "$regex": regexPatten } },
          { BougthDate: { "$regex": regexPatten } },
          { Brand: { "$regex": regexPatten } },
          { Duration: { "$regex": regexPatten } },
          { Expense: { "$regex": regexPatten } },
          { Expire: { "$regex": regexPatten } },
          { MSOffice: { "$regex": regexPatten } },
          { MTM: { "$regex": regexPatten } },
          { Model: { "$regex": regexPatten } },
          { Owner: { "$regex": regexPatten } },
          { Remark: { "$regex": regexPatten } },
          { SerialNo: { "$regex": regexPatten } },
        ]
      };
      count_docs = await collection.countDocuments(query);
      docs = await collection.find(query).sort({ [sort]: 1 }).skip(skip).limit(pageSize).toArray();
    }
    
    console.log("find assets successfully!");

    return { docs, count_docs };
  }

  async findTypes(): Promise<string[]> {
    const { collection } = await this.connect("check-asset", "types");
    const result: string[] = (await collection.find({}).toArray()).map(doc => doc.name);
    return result;
  }
}

export { MongoService, MongoServiceInterface };