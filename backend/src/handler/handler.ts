import { Request, Response, } from "express";

import { MongoServiceInterface } from "../mongo_service/service";
import { AssetInterface } from "../models/asset";
import { PageOptType } from "../models/pageOpt";
import { TypeInterface } from "../models/type";

class Handler {
  private mongo: MongoServiceInterface;

  constructor(m: MongoServiceInterface) {
    this.mongo = m;
  }

  addNewAsset(): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        const newAsset: AssetInterface = req.body;
        const newType: TypeInterface = { name: req.body.Type };

        await this.mongo.insertAsset(newAsset);
        await this.mongo.insertType(newType);

        res.send("Add new asset successfully!");
      } catch (err) {
        res.status(400).json({
          message: `Error at addNewAsset(): ${err}`
        });
      }
    }
  }

  getAssets(): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        let page: number | undefined = parseInt(req.query.page as string);
        let pageSize: number | undefined = parseInt(req.query.pageSize as string);
        let type: string | undefined = req.query.type as string;
        let sort: string | undefined = req.query.sort as string;
        let search: string | undefined = req.query.search as string;
        
        if (page === undefined) page = 1;
        if (pageSize === undefined) pageSize = 10;
        const pageOpt: PageOptType = {
          page: page,
          pageSize: pageSize,
          type: type,
          sort: sort,
          search: search
        };

        const result = await this.mongo.findAssets(pageOpt);

        res.json(result);
      } catch (err) {
        res.status(400).json({
          message: `Error at getAssets(): ${err}`
        });
      }
    }
  }

  getTypes(): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response): Promise<void>  => {
      try {
        const result = await this.mongo.findTypes();
        res.json(result);
      } catch (err) {
        res.status(400).json({
          message: `Error at getTypes(): ${err}`
        });
      }
    }
  }
}

export { Handler }