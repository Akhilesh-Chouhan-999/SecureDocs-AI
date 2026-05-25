export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container p-6 rounded-xl border border-outline-variant max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-on-surface-variant mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded hover:bg-surface-container-highest">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-error text-on-error rounded hover:bg-error/90">Confirm</button>
        </div>
      </div>
    </div>
  );
}
