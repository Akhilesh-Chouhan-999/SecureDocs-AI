/**
 * Generic repository interface defining data access contracts.
 * Typings can be supplied for specific entity types.
 */
export interface IRepository<T = any> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, any>, pagination?: any): Promise<T[]>;
  create(data: any): Promise<T>;
  updateById(id: string, data: any): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
}

export default IRepository;
