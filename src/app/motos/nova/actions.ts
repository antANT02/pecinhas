"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const esquemaMoto = z.object({
  marca: z
    .string()
    .trim()
    .min(2, "Informe a marca da moto.")
    .max(80, "A marca deve ter até 80 caracteres."),

  modelo: z
    .string()
    .trim()
    .min(2, "Informe o modelo da moto.")
    .max(120, "O modelo deve ter até 120 caracteres."),

  ano: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Informe o ano com 4 números.")
    .transform(Number)
    .refine(
      (ano) => ano >= 1900 && ano <= new Date().getFullYear() + 1,
      "Informe um ano entre 1900 e o próximo ano.",
    ),

  placa: z
    .string()
    .trim()
    .toUpperCase()
    .transform((placa) => placa.replace(/[\s-]/g, ""))
    .refine(
      (placa) =>
        placa === "" || /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(placa),
      "Informe uma placa como ABC1234 ou ABC1D23.",
    ),

  cor: z
    .string()
    .trim()
    .max(40, "A cor deve ter até 40 caracteres."),

  descricao: z
    .string()
    .trim()
    .max(2000, "A descrição deve ter até 2000 caracteres."),
});

function lerTexto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

export async function cadastrarMoto(formData: FormData) {
  const valores = {
    marca: lerTexto(formData, "marca"),
    modelo: lerTexto(formData, "modelo"),
    ano: lerTexto(formData, "ano"),
    placa: lerTexto(formData, "placa"),
    cor: lerTexto(formData, "cor"),
    descricao: lerTexto(formData, "descricao"),
  };

  try {
    const sessao = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessao) {
      return {
        error: "Sua sessão expirou. Entre novamente para cadastrar.",
        sucesso: false,
        valores,
      };
    }

    const validacao = esquemaMoto.safeParse(valores);

    if (!validacao.success) {
      return {
        error:
          validacao.error.issues[0]?.message ??
          "Confira os dados informados.",
        sucesso: false,
        valores,
      };
    }

    const dados = validacao.data;

    await prisma.moto.create({
      data: {
        marca: dados.marca,
        modelo: dados.modelo,
        ano: dados.ano,
        placa: dados.placa || null,
        cor: dados.cor || null,
        descricao: dados.descricao || null,
        user: {
          connect: {
            id: sessao.user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return {
      error: "",
      sucesso: true,
      valores,
    };
  } catch {
    return {
      error: "Não foi possível cadastrar a moto. Tente novamente.",
      sucesso: false,
      valores,
    };
  }
}