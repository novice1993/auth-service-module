import { atomWithStorage } from "jotai/utils";
import { LoginState } from "@/hooks/useLoginState";

export const loginStateAtom = atomWithStorage<LoginState | null>(
  "AUTH_STATE",
  null
);
