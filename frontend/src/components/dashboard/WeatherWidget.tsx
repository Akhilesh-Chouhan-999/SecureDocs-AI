export function WeatherWidget() {
  return (
    <div className="p-4 bg-surface-container rounded-xl border border-outline-variant">
      <h3 className="font-headline-sm text-on-surface">Secure Node Status</h3>
      <div className="mt-2 flex items-center gap-4">
        <span className="material-symbols-outlined text-success text-3xl">cloud_done</span>
        <div>
          <p className="text-sm text-on-surface-variant">All systems optimal</p>
          <p className="text-xs text-primary font-mono">Latency: 24ms</p>
        </div>
      </div>
    </div>
  );
}
