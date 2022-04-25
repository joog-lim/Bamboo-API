import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  Between,
} from "typeorm";

import { ReportAlgorithm } from "../entity";

@EntityRepository(ReportAlgorithm)
export class ReportAlgorithmRepository extends Repository<ReportAlgorithm> {
  async getReportAlgorithmIdxList(
    subId: string,
    [firstIdx, lastIdx]: [number, number],
  ): Promise<ReportAlgorithm[]> {
    return this.find({
      relations: ["algorithm"],
      where: { user: subId, algorithm: Between(lastIdx, firstIdx) },
    });
  }

  report(subId: string, algorithmNumber: number): Promise<InsertResult> {
    return this.insert({
      user: { subId },
      algorithm: { idx: algorithmNumber },
    });
  }

  cancel(idx: number): Promise<DeleteResult> {
    return this.delete(idx);
  }
}
