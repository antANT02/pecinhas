"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function excluirMoto(id: string) {
  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    return {
      error: "Sua sessão terminou. Entre novamente para excluir.",
      sucesso: false,
    };
  }

  const resultado = z.string().cuid().safeParse(id);

  if (!resultado.success) {
    return {
      error: "O identificador da moto é inválido.",
      sucesso: false,
    };
  }

  try {
    const exclusao = await prisma.moto.deleteMany({
      where: {
        id: resultado.data,
        userId: sessao.user.id,
      },
    });

    if (exclusao.count === 0) {
      return {
        error: "Moto não encontrada ou você não tem permissão para excluí-la.",
        sucesso: false,
      };
    }
  } catch {
    return {
      error: "Não foi possível excluir a moto. Tente novamente.",
      sucesso: false,
    };
  }

  revalidatePath("/painel");
  revalidatePath(`/motos/${resultado.data}`);

  return {
    error: "",
    sucesso: true,
  };
}