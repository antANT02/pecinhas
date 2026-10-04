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

function falha(error: string) {
  return {
    error,
    sucesso: false,
    aviso: "",
  };
}

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

function pertenceAMoto(
  endereco: string,
  userId: string,
  motoId: string
) {
  try {
    const url = new URL(endereco);

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      url.pathname.startsWith(`/motos/${userId}/${motoId}/`)
    );
  } catch {
    return false;
  }
}

async function apagarArquivo(endereco: string) {
  try {
    await del(endereco);
    return true;
  } catch {
    console.warn("LIMPEZA_FOTO: não foi possível excluir um arquivo.");
    return false;
  }
}

export async function enviarFoto(motoId: string, formData: FormData) {
  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    return falha(
      "Sua sessão terminou. Entre novamente para enviar a foto."
    );
  }

  const idValidado = z.string().cuid().safeParse(motoId);

  if (!idValidado.success) {
    return falha("O identificador da moto é inválido.");
  }

  const arquivo = formData.get("imagem");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return falha("Selecione uma imagem.");
  }

  if (arquivo.size > tamanhoMaximo) {
    return falha("A imagem deve ter no máximo 2 MB.");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
    return falha("Envie uma imagem JPG, PNG ou WebP.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return falha("O armazenamento de imagens ainda não está configurado.");
  }

  let novaUrl: string | null = null;
  let fotoAnterior: string | null = null;

  try {
    const moto = await prisma.moto.findFirst({
      where: {
        id: idValidado.data,
        userId: sessao.user.id,
      },
      select: {
        id: true,
        imagemUrl: true,
      },
    });

    if (!moto) {
      return falha(
        "Moto não encontrada ou você não tem permissão para alterar a foto."
      );
    }

    const bytes = Buffer.from(await arquivo.arrayBuffer());
    const formato = identificarImagem(bytes);

    if (!formato || formato.tipo !== arquivo.type) {
      return falha(
        "O arquivo não corresponde a uma imagem JPG, PNG ou WebP."
      );
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
        imagemUrl: moto.imagemUrl,
      },
      data: {
        imagemUrl: blob.url,
      },
    });

    if (atualizacao.count === 0) {
      const limpou = await apagarArquivo(blob.url);
      novaUrl = null;

      return falha(
        limpou
          ? "A moto foi excluída ou sua foto mudou durante o envio. Atualize a página e tente novamente."
          : "A foto não foi salva e o arquivo enviado não pôde ser removido do Blob. Confira o armazenamento."
      );
    }

    fotoAnterior = moto.imagemUrl;
    novaUrl = null;
  } catch {
    let limpou = true;

    if (novaUrl) {
      limpou = await apagarArquivo(novaUrl);
    }

    return falha(
      limpou
        ? "Não foi possível salvar a foto. Tente novamente."
        : "Não foi possível salvar a foto nem remover o arquivo enviado do Blob. Confira o armazenamento."
    );
  }

  let aviso = "";

  if (
    fotoAnterior &&
    pertenceAMoto(fotoAnterior, sessao.user.id, idValidado.data)
  ) {
    const limpou = await apagarArquivo(fotoAnterior);

    if (!limpou) {
      aviso =
        "A nova foto foi salva, mas não foi possível excluir o arquivo anterior. A limpeza deverá ser feita no painel do Blob.";
    }
  }

  revalidatePath("/");
  revalidatePath("/painel");
  revalidatePath(`/motos/${idValidado.data}`);
  revalidatePath(`/motos/${idValidado.data}/foto`);

  return {
    error: "",
    sucesso: true,
    aviso,
  };
}