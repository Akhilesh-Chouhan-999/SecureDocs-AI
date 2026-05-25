import { UIDocument } from '../../types';
import { GlassCard } from '../ui/GlassCard';

export function RecentDocumentsTable({ documents }: { documents: UIDocument[] }) {
  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="p-lg border-b border-outline-variant flex items-center justify-between">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">Recent Documents</h3>
          <p className="text-sm text-on-surface-variant">Latest analyzed files</p>
        </div>
        <button className="text-sm text-primary hover:underline cursor-pointer">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/50 text-label-mono font-label-mono text-on-surface-variant text-xs uppercase bg-surface-container-low/50">
              <th className="px-lg py-md font-medium">Document</th>
              <th className="px-lg py-md font-medium">Type</th>
              <th className="px-lg py-md font-medium">Risk Score</th>
              <th className="px-lg py-md font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-surface-container-highest/50 transition-colors cursor-pointer group">
                <td className="px-lg py-md">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">description</span>
                    <span className="font-medium text-on-surface">{doc.name}</span>
                  </div>
                </td>
                <td className="px-lg py-md text-on-surface-variant">{doc.type}</td>
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${doc.riskScore > 70 ? 'bg-error' : doc.riskScore > 40 ? 'bg-tertiary-container' : 'bg-primary'}`} 
                        style={{ width: `${doc.riskScore}%` }} 
                      />
                    </div>
                    <span className="text-sm font-label-mono text-on-surface-variant">{doc.riskScore}</span>
                  </div>
                </td>
                <td className="px-lg py-md">
                  <span className={`text-label-mono font-label-mono text-xs px-2 py-1 rounded border ${
                    doc.riskScore > 70 ? 'bg-error/10 border-error/20 text-error' : 
                    doc.riskScore > 40 ? 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary-container' : 'bg-primary/10 border-primary/20 text-primary'
                  }`}>
                    {doc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
