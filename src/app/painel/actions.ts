"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function sair() {
  try {
    const cabecalhos = await headers();

    await auth.api.getSession({
      headers: cabecalhos,
    });

    await auth.api.signOut({
      headers: cabecalhos,
    });

    return {
      sucesso: true,
      error: "",
    };
  } catch {
    return {
      sucesso: false,
      error: "Não foi possível sair. Tente novamente.",
    };
  }
}