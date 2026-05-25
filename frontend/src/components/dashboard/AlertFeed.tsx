import { Alert } from '../../types';

export function AlertFeed({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-md space-y-md min-h-[250px]">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`flex gap-md p-sm hover:bg-surface-container-highest rounded-lg transition-colors border-l-2 ${
            alert.severity === 'high' ? 'border-error' : 
            alert.severity === 'medium' ? 'border-tertiary-container' : 'border-outline-variant'
          }`}
        >
          <span className={`material-symbols-outlined ${
            alert.severity === 'high' ? 'text-error' : 
            alert.severity === 'medium' ? 'text-tertiary-container' : 'text-outline'
          }`}>
            {alert.type === 'fraud' ? 'report' : alert.type === 'anomaly' ? 'fingerprint' : 'info'}
          </span>
          <div>
            <p className="text-body-sm font-body-sm text-on-surface">{alert.title}</p>
            <p className="text-label-mono font-label-mono text-on-surface-variant text-[10px] truncate max-w-[200px]">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
