import { useEffect, useState } from "react";
import api from "../services/api";
import FraudCard from "../components/shared/FraudCard";
import {
  FiActivity,
  FiShield,
  FiFileText,
  FiAlertTriangle,
} from "react-icons/fi";

import { Report } from "../types";

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Stubbing data if endpoint is not fully returning yet
      const data = await api.get("/reports").catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        setReports(data);
      } else {
        // Fallback for demonstration
        setReports([
          {
            _id: "1",
            documentId: "DOC-89324",
            riskLevel: "Critical",
            riskScore: 92,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "2",
            documentId: "DOC-89325",
            riskLevel: "High",
            riskScore: 75,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "3",
            documentId: "DOC-89326",
            riskLevel: "Low",
            riskScore: 12,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const criticalReports = reports.filter((r) => r.riskLevel === "Critical");
  const highRiskReports = reports.filter((r) => r.riskLevel === "High");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Overview
        </h1>
        <p className="text-neutral-400 mt-1">
          Real-time fraud analysis and risk monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiAlertTriangle className="w-24 h-24 text-red-500 transform rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <FiAlertTriangle />
              <span className="font-medium">Critical Fraud</span>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {criticalReports.length}
            </p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiActivity className="w-24 h-24 text-orange-500 transform rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-orange-400 mb-2">
              <FiActivity />
              <span className="font-medium">High Risk</span>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {highRiskReports.length}
            </p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiFileText className="w-24 h-24 text-blue-500 transform rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <FiShield />
              <span className="font-medium">Total Analyzed</span>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {reports.length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-foreground">
            Recent Analysis
          </h2>
          <button className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.slice(0, 4).map((report) => (
            <FraudCard key={report._id} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
}
