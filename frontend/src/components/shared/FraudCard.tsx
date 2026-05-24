import { FiAlertCircle, FiCheckCircle, FiInfo, FiShield } from "react-icons/fi";
import { Report } from "../../types";
import { formatDate } from "../../utils/formatters";

export default function FraudCard({ report }: { report: Report }) {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case "Critical":
        return {
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          icon: FiAlertCircle,
        };
      case "High":
        return {
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
          icon: FiAlertCircle,
        };
      case "Medium":
        return {
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/20",
          icon: FiInfo,
        };
      default:
        return {
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          icon: FiCheckCircle,
        };
    }
  };

  const config = getRiskConfig(report.riskLevel);
  const Icon = config.icon;

  return (
    <div className="glass rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div
            className={`p-3 rounded-xl ${config.bg} ${config.color} shadow-sm`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {report.documentId}
            </h3>
            <p className="text-sm text-neutral-400 mt-1">
              {formatDate(report.createdAt)}
            </p>
          </div>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${config.bg} ${config.color} ${config.border}`}
        >
          {report.riskLevel} Risk
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span className="text-neutral-400 flex items-center gap-1">
            <FiShield /> Risk Score
          </span>
          <span className={config.color}>{report.riskScore}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              report.riskScore >= 80
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : report.riskScore >= 60
                  ? "bg-gradient-to-r from-orange-400 to-orange-500"
                  : report.riskScore >= 30
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    : "bg-gradient-to-r from-emerald-400 to-emerald-500"
            }`}
            style={{ width: `${report.riskScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
