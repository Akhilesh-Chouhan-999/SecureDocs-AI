import {
  UserRepository,
  DocumentRepository,
  FraudReportRepository,
  HistoricalRepository,
} from "../repositories";

import {
  AuthService,
  DocumentService,
  AnalysisService,
  HistoryService,
  ReportService,
  JobService,
} from "../services";

import type { ServiceRegistry } from "../types/container";

/**
 * Dependency Injection Container for resolving singleton instances
 */
class Container {
  private singletons: Map<keyof ServiceRegistry, any>;

  constructor() {
    this.singletons = new Map();
  }

  /**
   * Resolve a registered dependency by its token name
   * @param name Name of the dependency token to retrieve
   */
  public get<K extends keyof ServiceRegistry>(name: K): ServiceRegistry[K] {
    if (!this.singletons.has(name)) {
      this.singletons.set(name, this.create(name));
    }
    return this.singletons.get(name);
  }

  /**
   * Factory method to create new instances of requested dependencies
   * @param name Name of the dependency to construct
   */
  private create<K extends keyof ServiceRegistry>(name: K): ServiceRegistry[K] {
    switch (name) {
      case "userRepository":
        return new UserRepository() as any;

      case "documentRepository":
        return new DocumentRepository() as any;

      case "fraudReportRepository":
        return new FraudReportRepository() as any;

      case "historicalRepository":
        return new HistoricalRepository() as any;

      case "authService":
        return new AuthService(this.get("userRepository")) as any;

      case "documentService":
        return new DocumentService(this.get("documentRepository")) as any;

      case "analysisService":
        return new AnalysisService(
          this.get("documentService"),
          this.get("historicalRepository"),
        ) as any;

      case "historyService":
        return new HistoryService(this.get("historicalRepository")) as any;

      case "reportService":
        return new ReportService(
          this.get("documentService"),
          this.get("fraudReportRepository"),
        ) as any;

      case "jobService":
        return new JobService(this.get("analysisService")) as any;

      default:
        throw new Error(`Dependency '${name}' is not registered`);
    }
  }
}

export const container = new Container();
export default container;
