import { Button } from '../ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-md">
      <div className="glass-card p-lg rounded-xl max-w-[384px] w-full border border-white/10 shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <h3 className="text-body-lg font-headline-md text-on-surface mb-sm">{title}</h3>
        <p className="text-body-sm text-on-surface-variant mb-lg">{message}</p>
        <div className="flex justify-end gap-md">
          <button 
            onClick={onClose} 
            className="px-md py-sm rounded-lg text-label-mono font-label-mono text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <Button 
            onClick={onConfirm} 
            className="bg-error text-on-error hover:bg-error/90 font-label-mono text-label-mono px-md py-sm rounded-lg"
          >
            CONFIRM
          </Button>
        </div>
      </div>
    </div>
  );
}
