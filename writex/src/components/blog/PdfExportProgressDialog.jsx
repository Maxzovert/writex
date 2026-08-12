import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0) return `${min}:${String(sec).padStart(2, '0')}`;
  return `${sec}s`;
}

/**
 * Blocking progress dialog while a PDF is being generated.
 * Does not allow dismiss while status is "exporting".
 */
export function PdfExportProgressDialog({
  open,
  status = 'exporting',
  percent = 0,
  message = 'Preparing…',
  errorMessage,
  onClose,
}) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!open || status !== 'exporting') return undefined;
    setElapsedMs(0);
    const started = performance.now();
    const id = window.setInterval(() => {
      setElapsedMs(performance.now() - started);
    }, 200);
    return () => window.clearInterval(id);
  }, [open, status]);

  const isExporting = status === 'exporting';
  const isDone = status === 'done';
  const isError = status === 'error';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isExporting) onClose?.();
      }}
    >
      <DialogContent
        showCloseButton={!isExporting}
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (isExporting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isExporting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isError ? 'PDF export failed' : isDone ? 'PDF ready' : 'Converting to PDF'}
          </DialogTitle>
          <DialogDescription>
            {isExporting
              ? 'Please wait — the file will download only when conversion finishes.'
              : isDone
                ? 'Your styled note has been downloaded.'
                : errorMessage || 'Something went wrong while creating the PDF.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2 text-foreground">
              {isExporting ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              ) : null}
              <span className="truncate">{message}</span>
            </div>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatElapsed(elapsedMs)}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                isError ? 'bg-destructive' : 'bg-foreground'
              }`}
              style={{ width: `${Math.max(isError ? 100 : 0, Math.min(100, percent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{isError ? 'Failed' : `${Math.round(percent)}% complete`}</span>
            {isExporting ? <span>Do not close this tab</span> : null}
          </div>

          {(isDone || isError) && (
            <button
              type="button"
              onClick={onClose}
              className="mt-1 inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
            >
              Close
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
