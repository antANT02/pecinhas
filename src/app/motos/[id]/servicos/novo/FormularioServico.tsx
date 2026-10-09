"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { criarServico } from "./actions";

type FormularioServicoProps = {
  motoId: string;
};

export default function FormularioServico({
  motoId,
}: FormularioServicoProps) {
  const router = useRouter();

  const [valores, setValores] = useState({
    titulo: "",
    descricao: "",
    dataServico: "",
    valor: "",
  });

  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando) return;

    const formData = new FormData(evento.currentTarget);

    setErro("");
    setEnviando(true);

    try {
      const resultado = await criarServico(motoId, formData);

      if (!resultado.sucesso) {
        setValores(resultado.valores);
        setErro(resultado.error);
        setEnviando(false);
        return;
      }

      router.replace(`/motos/${motoId}`);
      router.refresh();
    } catch {
      setErro("Não foi possível enviar o formulário. Tente novamente.");
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

      <div>
        <label htmlFor="titulo" className="mb-1 block font-medium">
          Serviço *
        </label>

        <input
          id="titulo"
          name="titulo"
          type="text"
          placeholder="Ex.: Troca de óleo"
          value={valores.titulo}
          onChange={(evento) =>
            setValores((anteriores) => ({
              ...anteriores,
              titulo: evento.target.value,
            }))
          }
          minLength={2}
          maxLength={120}
          required
          disabled={enviando}
          className="psCampo"
        />
      </div>

      <div>
        <label htmlFor="dataServico" className="mb-1 block font-medium">
          Data do serviço *
        </label>

        <input
          id="dataServico"
          name="dataServico"
          type="date"
          min="1900-01-01"
          value={valores.dataServico}
          onChange={(evento) =>
            setValores((anteriores) => ({
              ...anteriores,
              dataServico: evento.target.value,
            }))
          }
          required
          disabled={enviando}
          className="psCampo"
        />
      </div>

      <div>
        <label htmlFor="valor" className="mb-1 block font-medium">
          Valor em reais *
        </label>

        <input
          id="valor"
          name="valor"
          type="text"
          inputMode="decimal"
          placeholder="Ex.: 85,50"
          value={valores.valor}
          onChange={(evento) =>
            setValores((anteriores) => ({
              ...anteriores,
              valor: evento.target.value,
            }))
          }
          maxLength={11}
          required
          disabled={enviando}
          className="psCampo"
        />

        <p className="mt-1 text-sm psTextoSecundario">
          Use somente números e vírgula ou ponto. Ex.: 85,50.
        </p>
      </div>

      <div>
        <label htmlFor="descricao" className="mb-1 block font-medium">
          Descrição
        </label>

        <textarea
          id="descricao"
          name="descricao"
          rows={5}
          maxLength={5000}
          value={valores.descricao}
          onChange={(evento) =>
            setValores((anteriores) => ({
              ...anteriores,
              descricao: evento.target.value,
            }))
          }
          disabled={enviando}
          className="psCampo"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enviando}
          className="psBotao psPrimario"
        >
          {enviando ? "Cadastrando..." : "Cadastrar serviço"}
        </button>

        <Link
          href={`/motos/${motoId}`}
          className="psLink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}