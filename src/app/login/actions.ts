"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";

const esquemaLogin = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .max(254, "O e-mail é muito longo.")
    .toLowerCase(),

  senha: z
    .string()
    .min(1, "Informe sua senha.")
    .max(128, "A senha deve ter até 128 caracteres."),
});

type ResultadoLogin = {
  error: string;
  sucesso: boolean;
  valores: {
    email: string;
  };
};

export async function entrar(
  formData: FormData,
): Promise<ResultadoLogin> {
  const campoEmail = formData.get("email");
  const campoSenha = formData.get("senha");

  const valores = {
    email: typeof campoEmail === "string" ? campoEmail : "",
  };

  const validacao = esquemaLogin.safeParse({
    email: valores.email,
    senha: typeof campoSenha === "string" ? campoSenha : "",
  });

  if (!validacao.success) {
    return {
      error:
        validacao.error.issues[0]?.message ??
        "Confira os dados informados.",
      sucesso: false,
      valores,
    };
  }

  try {
    const cabecalhos = await headers();

    await auth.api.getSession({
      headers: cabecalhos,
    });

    await auth.api.signInEmail({
      headers: cabecalhos,
      body: {
        email: validacao.data.email,
        password: validacao.data.senha,
      },
    });

    return {
      error: "",
      sucesso: true,
      valores,
    };
  } catch (erro) {
    if (erro instanceof APIError) {
      if (erro.statusCode === 429) {
        return {
          error: "Muitas tentativas. Aguarde e tente novamente.",
          sucesso: false,
          valores,
        };
      }

      if (
        erro.statusCode === 400 ||
        erro.statusCode === 401 ||
        erro.statusCode === 403 ||
        erro.statusCode === 422
      ) {
        return {
          error: "E-mail ou senha inválidos.",
          sucesso: false,
          valores,
        };
      }
    }

    return {
      error: "Não foi possível entrar. Tente novamente.",
      sucesso: false,
      valores,
    };
  }
}