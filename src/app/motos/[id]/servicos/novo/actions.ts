"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schemaServico = z.object({
  titulo: z
    .string()
    .trim()
    .min(2, "Informe um título com pelo menos 2 caracteres.")
    .max(120, "O título pode ter até 120 caracteres."),

  descricao: z
    .string()
    .trim()
    .max(5000, "A descrição pode ter até 5000 caracteres."),

  dataServico: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.")
    .refine((valor) => {
      const data = new Date(`${valor}T00:00:00.000Z`);

      return (
        valor >= "1900-01-01" &&
        !Number.isNaN(data.getTime()) &&
        data.toISOString().slice(0, 10) === valor
      );
    }, "Informe uma data válida a partir de 1900."),

  valor: z
    .string()
    .trim()
    .transform((valor) => valor.replace(",", "."))
    .refine(
      (valor) => /^\d{1,8}(\.\d{1,2})?$/.test(valor),
      "Informe um valor entre 0 e 99999999,99, com até duas casas decimais."
    ),
});

function lerTexto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

export async function criarServico(motoId: string, formData: FormData) {
  const valores = {
    titulo: lerTexto(formData, "titulo"),
    descricao: lerTexto(formData, "descricao"),
    dataServico: lerTexto(formData, "dataServico"),
    valor: lerTexto(formData, "valor"),
  };

  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    return {
      error: "Sua sessão terminou. Entre novamente para cadastrar.",
      sucesso: false,
      valores,
    };
  }

  const idValidado = z.string().cuid().safeParse(motoId);

  if (!idValidado.success) {
    return {
      error: "O identificador da moto é inválido.",
      sucesso: false,
      valores,
    };
  }

  const resultado = schemaServico.safeParse(valores);

  if (!resultado.success) {
    return {
      error: resultado.error.issues[0]?.message || "Confira os campos.",
      sucesso: false,
      valores,
    };
  }

  const dados = resultado.data;

  try {
    const moto = await prisma.moto.findFirst({
      where: {
        id: idValidado.data,
        userId: sessao.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!moto) {
      return {
        error: "Moto não encontrada ou você não tem permissão para cadastrar serviços nela.",
        sucesso: false,
        valores,
      };
    }

    await prisma.servico.create({
      data: {
        titulo: dados.titulo,
        descricao: dados.descricao || null,
        dataServico: new Date(`${dados.dataServico}T00:00:00.000Z`),
        valor: dados.valor,
        motoId: moto.id,
        userId: sessao.user.id,
      },
    });
  } catch {
    return {
      error: "Não foi possível cadastrar o serviço. Tente novamente.",
      sucesso: false,
      valores,
    };
  }

  revalidatePath(`/motos/${idValidado.data}`);

  return {
    error: "",
    sucesso: true,
    valores,
  };
}