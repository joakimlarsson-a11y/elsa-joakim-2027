import { UUID_PATTERN } from "@/lib/site";
import { createAnonClient } from "@/lib/supabase/server";
import type { Invitation } from "./types";

export async function loadInvitation(token: string): Promise<Invitation | null> {
  if (!UUID_PATTERN.test(token)) return null;
  try {
    const { data, error } = await createAnonClient().rpc("get_invitation_by_token", { p_token: token });
    if (error) {
      console.error("get_invitation_by_token failed:", error);
      return null;
    }
    return (data as Invitation | null) ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
