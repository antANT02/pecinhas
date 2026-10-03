"use server";

import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const tamanhoMaximo = 2 * 1024 * 1024;

function identificarImagem(bytes: Buffer) {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { tipo: "image/jpeg", extensao: "jpg" };
  }

  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return { tipo: "image/png", extensao: "png" };
  }

  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { tipo: "image/webp", extensao: "webp" };
  }

  return null;
}

export async function enviarFoto(motoId: string, formData: FormData) {
  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    return {
      error: "Sua sessão terminou. Entre novamente para enviar a foto.",
      sucesso: false,
    };
  }

  const idValidado = z.string().cuid().safeParse(motoId);

  if (!idValidado.success) {
    return {
      error: "O identificador da moto é inválido.",
      sucesso: false,
    };
  }

  const arquivo = formData.get("imagem");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return {
      error: "Selecione uma imagem.",
      sucesso: false,
    };
  }

  if (arquivo.size > tamanhoMaximo) {
    return {
      error: "A imagem deve ter no máximo 2 MB.",
      sucesso: false,
    };
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
    return {
      error: "Envie uma imagem JPG, PNG ou WebP.",
      sucesso: false,
    };
  }

  let novaUrl: string | null = null;

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
        error: "Moto não encontrada ou você não tem permissão para alterar a foto.",
        sucesso: false,
      };
    }

    const bytes = Buffer.from(await arquivo.arrayBuffer());
    const formato = identificarImagem(bytes);

    if (!formato || formato.tipo !== arquivo.type) {
      return {
        error: "O arquivo não corresponde a uma imagem JPG, PNG ou WebP.",
        sucesso: false,
      };
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return {
        error: "O armazenamento de imagens ainda não está configurado.",
        sucesso: false,
      };
    }

    const caminho =
      `motos/${sessao.user.id}/${moto.id}/` +
      `${randomUUID()}.${formato.extensao}`;

    const blob = await put(caminho, bytes, {
      access: "public",
      contentType: formato.tipo,
      addRandomSuffix: true,
    });

    novaUrl = blob.url;

    const atualizacao = await prisma.moto.updateMany({
      where: {
        id: moto.id,
        userId: sessao.user.id,
      },
      data: {
        imagemUrl: blob.url,
      },
    });

    if (atualizacao.count === 0) {
      await del(blob.url);
      novaUrl = null;

      return {
        error: "A moto não está mais disponível para receber a foto.",
        sucesso: false,
      };
    }
  } catch {
    if (novaUrl) {
      try {
        await del(novaUrl);
      } catch {
        // A falha na limpeza não impede a mensagem ao usuário.
      }
    }

    return {
      error: "Não foi possível salvar a foto. Confira a configuração do Blob e tente novamente.",
      sucesso: false,
    };
  }

  revalidatePath("/painel");
  revalidatePath(`/motos/${idValidado.data}`);
  revalidatePath(`/motos/${idValidado.data}/foto`);

  return {
    error: "",
    sucesso: true,
  };
}