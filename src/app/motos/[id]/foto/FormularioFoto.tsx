"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enviarFoto } from "./actions";

type FormularioFotoProps = {
  motoId: string;
};

export default function FormularioFoto({
  motoId,
}: FormularioFotoProps) {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [salvou, setSalvou] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando || salvou) return;

    const formData = new FormData(evento.currentTarget);
    const arquivo = formData.get("imagem");

    setErro("");
    setAviso("");

    if (!(arquivo instanceof File) || arquivo.size === 0) {
      setErro("Selecione uma imagem.");
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setEnviando(true);

    try {
      const resultado = await enviarFoto(motoId, formData);

      if (!resultado.sucesso) {
        setErro(resultado.error);
        setEnviando(false);
        return;
      }

      if (resultado.aviso) {
        setAviso(resultado.aviso);
        setSalvou(true);
        setEnviando(false);
        router.refresh();
        return;
      }

      router.replace(`/motos/${motoId}`);
      router.refresh();
    } catch {
      setErro("Não foi possível concluir o pedido. Confira os detalhes da moto antes de tentar novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="psFormulario mt-6 space-y-4">
      {erro && (
        <p
          role="alert"
          className="psAviso psErro"
        >
          {erro}
        </p>
      )}

      {aviso && (
        <p
          role="status"
          className="psAviso psAtencao"
        >
          {aviso}
        </p>
      )}

      <div>
        <label htmlFor="imagem" className="mb-2 block font-medium">
          Foto da moto
        </label>

        <input
          id="imagem"
          name="imagem"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={enviando || salvou}
          className="psCampo psArquivo"
        />

        <p className="mt-2 text-sm psTextoSecundario">
          JPG, PNG ou WebP. Tamanho máximo: 2 MB.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enviando || salvou}
          className="psBotao psPrimario"
        >
          {salvou
            ? "Foto salva"
            : enviando
              ? "Enviando..."
              : "Salvar foto"}
        </button>

        <Link
          href={`/motos/${motoId}`}
          className="psLink"
        >
          {salvou ? "Ver detalhes" : "Cancelar"}
        </Link>
      </div>
    </form>
  );
}