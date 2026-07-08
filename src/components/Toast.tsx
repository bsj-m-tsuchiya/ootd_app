"use client";

export type ToastMessage = {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
  action?: {
    label: string;
    onAction: () => void;
  };
};

type Props = {
  toasts: ToastMessage[];
};

export default function ToastStack({ toasts }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div aria-live="polite" className="toast-stack" role="status">
      {toasts.map((toast) => (
        <p className={`toast toast-${toast.tone}${toast.action ? " has-action" : ""}`} key={toast.id}>
          {toast.message}
          {toast.action ? (
            <button className="toast-action" onClick={toast.action.onAction} type="button">
              {toast.action.label}
            </button>
          ) : null}
        </p>
      ))}
    </div>
  );
}
