"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";

const esquemaCadastro = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(100, "O nome deve ter até 100 caracteres."),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .max(254, "O e-mail é muito longo.")
    .toLowerCase(),

  senha: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(128, "A senha deve ter até 128 caracteres."),
});

type ResultadoCadastro = {
  error: string;
  sucesso: boolean;
  valores: {
    nome: string;
    email: string;
  };
};

function lerTexto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

function registrarErro(erro: unknown, senha: string) {
  let mensagem =
    erro instanceof Error ? erro.message : "Erro desconhecido";

  const segredos = [
    process.env.DATABASE_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.BETTER_AUTH_SECRET,
    process.env.BLOB_READ_WRITE_TOKEN,
    senha,
  ]
    .filter(
      (valor): valor is string =>
        typeof valor === "string" && valor.length > 0,
    )
    .sort((primeiro, segundo) => segundo.length - primeiro.length);

  for (const segredo of segredos) {
    mensagem = mensagem.split(segredo).join("[OCULTO]");
  }

  mensagem = mensagem.replace(
    /postgres(?:ql)?:\/\/[^\s]+/gi,
    "[CONEXAO OCULTADA]",
  );

  console.error("[Erro no cadastro]", mensagem);
}

export async function cadastrar(
  formData: FormData,
): Promise<ResultadoCadastro> {
  const valores = {
    nome: lerTexto(formData, "nome"),
    email: lerTexto(formData, "email"),
  };

  const senha = lerTexto(formData, "senha");

  const validacao = esquemaCadastro.safeParse({
    ...valores,
    senha,
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

    const sessao = await auth.api.getSession({
      headers: cabecalhos,
    });

    if (sessao) {
      return {
        error: "Você já está conectado a uma conta.",
        sucesso: false,
        valores,
      };
    }

    await auth.api.signUpEmail({
      headers: cabecalhos,
      body: {
        name: validacao.data.nome,
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
    registrarErro(erro, senha);

    if (erro instanceof APIError) {
      const codigo = erro.body?.code;

      if (
        codigo === "USER_ALREADY_EXISTS" ||
        codigo === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        return {
          error: "Esse e-mail já está cadastrado.",
          sucesso: false,
          valores,
        };
      }

      if (erro.statusCode === 429) {
        return {
          error: "Muitas tentativas. Aguarde um pouco e tente novamente.",
          sucesso: false,
          valores,
        };
      }
    }

    return {
      error: "Não foi possível concluir o cadastro. Tente novamente.",
      sucesso: false,
      valores,
    };
  }
}