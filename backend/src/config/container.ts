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

/**
 * Dependency Injection Container for resolving singleton instances
 */
class Container {
  private singletons: Map<string, any>;

  constructor() {
    this.singletons = new Map();
  }

  /**
   * Resolve a registered dependency by its token name
   * @param name Name of the dependency token to retrieve
   */
  get(name: string): any {
    if (!this.singletons.has(name)) {
      this.singletons.set(name, this.create(name));
    }
    return this.singletons.get(name);
  }

  /**
   * Factory method to create new instances of requested dependencies
   * @param name Name of the dependency to construct
   */
  create(name: string): any {
    switch (name) {
      case "userRepository":
        return new UserRepository();

      case "documentRepository":
        return new DocumentRepository();

      case "fraudReportRepository":
        return new FraudReportRepository();

      case "historicalRepository":
        return new HistoricalRepository();

      case "authService":
        return new AuthService(this.get("userRepository"));

      case "documentService":
        return new DocumentService(this.get("documentRepository"));

      case "analysisService":
        return new AnalysisService(
          this.get("documentService"),
          this.get("historicalRepository"),
        );

      case "historyService":
        return new HistoryService(this.get("historicalRepository"));

      case "reportService":
        return new ReportService(
          this.get("documentService"),
          this.get("fraudReportRepository"),
        );

      case "jobService":
        return new JobService(this.get("analysisService"));

      default:
        throw new Error(`Dependency '${name}' is not registered`);
    }
  }
}

const container = new Container();

export default container;
export { container };
