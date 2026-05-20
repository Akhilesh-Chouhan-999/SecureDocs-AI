/**
 * Base data access implementation for Mongoose schemas
 */
export class BaseRepository {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  /**
   * Find document by ObjectId string
   * @param id String identifier representation of ObjectId
   * @param options Mongoose options object
   */
  async findById(id: any, options: Record<string, any> = {}) {
    return this.model.findById(id, null, options).exec();
  }

  /**
   * Find single document matching search criteria
   * @param filter Criteria query mapping
   * @param options Query execution options
   */
  async findOne(filter: Record<string, any> = {}, options: Record<string, any> = {}) {
    return this.model.findOne(filter, null, options).exec();
  }

  /**
   * Find all documents matching filter query
   * @param filter Match filters query object
   * @param options Sorting, limit, skip, and populate configuration properties
   */
  async findAll(filter: Record<string, any> = {}, options: Record<string, any> = {}) {
    const query = this.model.find(filter);

    if (options.sort) query.sort(options.sort);
    if (options.populate) query.populate(options.populate);
    if (options.limit) query.limit(options.limit);
    if (options.skip) query.skip(options.skip);

    return query.exec();
  }

  /**
   * Create and persist single record
   * @param data Entity record fields
   */
  async create(data: any) {
    return this.model.create(data);
  }

  /**
   * Find document by ID and apply field updates
   * @param id String identifier representation of ObjectId
   * @param data Fields to update
   * @param options Options configuration object
   */
  async updateById(id: any, data: any, options: Record<string, any> = { new: true }) {
    return this.model.findByIdAndUpdate(id, data, options).exec();
  }

  /**
   * Remove single document matching ID
   * @param id String identifier representation of ObjectId
   */
  async deleteById(id: any) {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
