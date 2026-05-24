import { IRepository } from "./repository.interface.js";

export interface IService {
  // Base service interface
}

export interface IController {
  // Base controller interface
}

export interface IUseCase<T, R> {
  execute(params: T): Promise<R>;
}
export interface IProcessor<T, R> {
  process(data: T): Promise<R>;
}

export interface Workflow<T, R> {
  run(input: T): Promise<R>;
}

export type { IRepository };
