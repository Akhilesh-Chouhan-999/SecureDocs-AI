import type { Model } from "mongoose";
import type { IRepository } from "../core/interfaces/IRepository";

/**
 * Base data access implementation for Mongoose schemas
 */
export class BaseRepository<T = any> implements IRepository<T> {
  protected model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }

  /**
   * Find document by ObjectId string
   * @param id String identifier representation of ObjectId
   * @param options Mongoose options object
   */
  public async findById(id: string, options: any = {}): Promise<T | null> {
    return this.model.findById(id, null, options).exec();
  }

  /**
   * Find single document matching search criteria
   * @param filter Criteria query mapping
   * @param options Query execution options
   */
  public async findOne(filter: Record<string, any> = {}, options: any = {}): Promise<T | null> {
    return this.model.findOne(filter, null, options).exec();
  }

  /**
   * Find all documents matching filter query
   * @param filter Match filters query object
   * @param options Sorting, limit, skip, and populate configuration properties
   */
  public async findAll(
    filter: Record<string, any> = {},
    options: { sort?: any; populate?: any; limit?: number; skip?: number } = {},
  ): Promise<T[]> {
    const query = this.model.find(filter);

    if (options.sort) {
      query.sort(options.sort);
    }

    if (options.populate) {
      query.populate(options.populate);
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.skip) {
      query.skip(options.skip);
    }

    return query.exec();
  }

  /**
   * Create and persist single record
   * @param data Entity record fields
   */
  public async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  /**
   * Find document by ID and apply field updates
   * @param id String identifier representation of ObjectId
   * @param data Fields to update
   * @param options Options configuration object
   */
  public async updateById(id: string, data: any, options: any = { new: true }): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, options).exec();
  }

  /**
   * Remove single document matching ID
   * @param id String identifier representation of ObjectId
   */
  public async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export default BaseRepository;
