import type {
  UserRepository,
  DocumentRepository,
  FraudReportRepository,
  HistoricalRepository,
} from "../repositories";
import type {
  AuthService,
  DocumentService,
  AnalysisService,
  HistoryService,
  ReportService,
  JobService,
} from "../services";

/** Registry mapping of registered singleton classes in the DI Container */
export interface ServiceRegistry {
  userRepository: UserRepository;
  documentRepository: DocumentRepository;
  fraudReportRepository: FraudReportRepository;
  historicalRepository: HistoricalRepository;
  authService: AuthService;
  documentService: DocumentService;
  analysisService: AnalysisService;
  historyService: HistoryService;
  reportService: ReportService;
  jobService: JobService;
}

/** Token identifiers for dependency lookup */
export type ServiceToken = keyof ServiceRegistry;
