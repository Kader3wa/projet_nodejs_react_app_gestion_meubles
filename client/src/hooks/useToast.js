import { useContext } from "react";
import { ToastCtx } from "../components/ToastHost";

export function useToast() {
  return useContext(ToastCtx);
}
