const HANDLE_KEY = "kiroku-handle";

export function loadHandle() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(HANDLE_KEY) || "";
}

export function saveHandle(value: string) {
  if (typeof window === "undefined") return;
  const cleaned = value.trim().replace(/^@+/, "");
  if (cleaned) {
    window.localStorage.setItem(HANDLE_KEY, cleaned);
  } else {
    window.localStorage.removeItem(HANDLE_KEY);
  }
}
