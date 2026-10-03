"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schemaMoto = z.object({
  marca: z
    .string()
    .trim()
    .min(1, "Informe a marca.")
    .max(80, "A marca pode ter até 80 caracteres."),

  modelo: z
    .string()
    .trim()
    .min(1, "Informe o modelo.")
    .max(120, "O modelo pode ter até 120 caracteres."),

  ano: z
    .string()
    .regex(/^\d{4}$/, "Informe o ano com quatro números.")
    .transform(Number)
    .refine(
      (ano) => ano >= 1900 && ano <= new Date().getFullYear() + 1,
      "Informe um ano entre 1900 e o próximo ano."
    ),

  placa: z
    .string()
    .trim()
    .toUpperCase()
    .transform((placa) => placa.replace(/[\s-]/g, ""))
    .refine(
      (placa) => placa === "" || /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(placa),
      "Informe uma placa válida, como ABC1234 ou ABC1D23."
    ),

  cor: z
    .string()
    .trim()
    .max(40, "A cor pode ter até 40 caracteres."),

  descricao: z
    .string()
    .trim()
    .max(5000, "A descrição pode ter até 5000 caracteres."),
});

function lerTexto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

export async function editarMoto(id: string, formData: FormData) {
  const valores = {
    marca: lerTexto(formData, "marca"),
    modelo: lerTexto(formData, "modelo"),
    ano: lerTexto(formData, "ano"),
    placa: lerTexto(formData, "placa"),
    cor: lerTexto(formData, "cor"),
    descricao: lerTexto(formData, "descricao"),
  };

  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    return {
      error: "Sua sessão terminou. Entre novamente para salvar.",
      sucesso: false,
      valores,
    };
  }

  const resultado = schemaMoto.safeParse(valores);

  if (!resultado.success) {
    return {
      error: resultado.error.issues[0]?.message || "Confira os campos.",
      sucesso: false,
      valores,
    };
  }

  const dados = resultado.data;

  try {
    const atualizacao = await prisma.moto.updateMany({
      where: {
        id,
        userId: sessao.user.id,
      },
      data: {
        marca: dados.marca,
        modelo: dados.modelo,
        ano: dados.ano,
        placa: dados.placa || null,
        cor: dados.cor || null,
        descricao: dados.descricao || null,
      },
    });

    if (atualizacao.count === 0) {
      return {
        error: "Moto não encontrada ou você não tem permissão para editá-la.",
        sucesso: false,
        valores,
      };
    }
  } catch {
    return {
      error: "Não foi possível salvar. Tente novamente.",
      sucesso: false,
      valores,
    };
  }

  revalidatePath("/painel");
  revalidatePath(`/motos/${id}`);
  revalidatePath(`/motos/${id}/editar`);

  return {
    error: "",
    sucesso: true,
    valores,
  };
}