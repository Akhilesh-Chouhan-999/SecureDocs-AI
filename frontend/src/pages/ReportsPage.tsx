import { Card } from "../components/ui/Card";
import {
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiDownload,
} from "react-icons/fi";
import { Button } from "../components/ui/Button";

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Analytics & Reports
          </h1>
          <p className="text-neutral-400 mt-1">
            Deep insights into your document processing.
          </p>
        </div>
        <Button leftIcon={<FiDownload />} variant="secondary">
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center space-x-4 border-t-4 border-t-blue-500">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <FiPieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-400">Total Analyzed</p>
            <p className="text-2xl font-bold text-foreground">1,248</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 border-t-4 border-t-purple-500">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
            <FiBarChart2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-400">Fraud Detected</p>
            <p className="text-2xl font-bold text-foreground">42</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 border-t-4 border-t-emerald-500">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-400">Accuracy Rate</p>
            <p className="text-2xl font-bold text-foreground">99.8%</p>
          </div>
        </Card>
      </div>

      <Card className="min-h-[400px] flex items-center justify-center flex-col text-neutral-500 border-dashed border-2 bg-transparent">
        <FiPieChart className="w-16 h-16 mb-4 text-white/10" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Detailed Charts Coming Soon
        </h3>
        <p className="max-w-md text-center">
          We are currently integrating a comprehensive charting library to
          display temporal trends and risk distributions.
        </p>
      </Card>
    </div>
  );
}
