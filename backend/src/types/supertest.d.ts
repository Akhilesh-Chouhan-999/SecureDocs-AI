declare module "supertest" {
  import type { Server } from "http";
  import type { Express } from "express";

  function supertest(
    app: Express | Server,
  ): supertest.SuperTest<supertest.Test>;

  namespace supertest {
    interface SuperTest<T extends Test> {
      get(url: string): T;
      post(url: string): T;
      put(url: string): T;
      patch(url: string): T;
      delete(url: string): T;
      head(url: string): T;
      options(url: string): T;
      trace(url: string): T;
      connect(url: string): T;
    }

    interface Response {
      status: number;
      statusCode?: number;
      body: any;
      text: string;
      headers: Record<string, string | string[]>;
      [key: string]: any;
    }

    interface Test {
      set(field: string, value: string): Test;
      set(object: Record<string, string>): Test;
      query(object: Record<string, unknown>): Test;
      query(key: string, value: string): Test;
      attach(field: string, file: string): Test;
      field(name: string, value: string): Test;
      send(data: any): Test;
      expect(status: number): Test;
      expect(status: number, body: any): Test;
      expect(body: any): Test;
      expect(field: string, value: string): Test;
      expect(checker: (res: Response) => void): Test;
      end(
        callback?: (err: Error | null, res?: Response) => void,
      ): Promise<Response>;
      then(
        onFulfilled?:
          | ((value: Response) => PromiseLike<any> | any)
          | null
          | undefined,
        onRejected?:
          | ((reason: any) => PromiseLike<never> | never)
          | null
          | undefined,
      ): Promise<any>;
      catch(
        onRejected?:
          | ((reason: any) => PromiseLike<never> | never)
          | null
          | undefined,
      ): Promise<any>;
      finally(
        onFinally?: (() => PromiseLike<void> | void) | null | undefined,
      ): Promise<any>;
      [Symbol.toStringTag]: "Test";
    }
  }

  export default supertest;
}
