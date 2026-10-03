"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { editarMoto } from "./actions";

type ValoresMoto = {
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor: string;
  descricao: string;
};

type FormularioEditarMotoProps = {
  id: string;
  valoresIniciais: ValoresMoto;
};

const campos = [
  { nome: "marca", rotulo: "Marca", limite: 80, obrigatorio: true },
  { nome: "modelo", rotulo: "Modelo", limite: 120, obrigatorio: true },
  { nome: "ano", rotulo: "Ano", limite: 4, obrigatorio: true },
  { nome: "placa", rotulo: "Placa", limite: 20, obrigatorio: false },
  { nome: "cor", rotulo: "Cor", limite: 40, obrigatorio: false },
] as const;

export default function FormularioEditarMoto({
  id,
  valoresIniciais,
}: FormularioEditarMotoProps) {
  const router = useRouter();
  const [valores, setValores] = useState(valoresIniciais);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando) return;

    const formData = new FormData(evento.currentTarget);

    setErro("");
    setEnviando(true);

    try {
      const resultado = await editarMoto(id, formData);

      if (!resultado.sucesso) {
        setValores(resultado.valores);
        setErro(resultado.error);
        setEnviando(false);
        return;
      }

      router.replace(`/motos/${id}`);
      router.refresh();
    } catch {
      setErro("Não foi possível enviar o formulário. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-4">
      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800"
        >
          {erro}
        </p>
      )}

      {campos.map((campo) => (
        <div key={campo.nome}>
          <label
            htmlFor={campo.nome}
            className="mb-1 block font-medium"
          >
            {campo.rotulo}
            {campo.obrigatorio ? " *" : ""}
          </label>

          <input
            id={campo.nome}
            name={campo.nome}
            type="text"
            inputMode={campo.nome === "ano" ? "numeric" : "text"}
            value={valores[campo.nome]}
            onChange={(evento) =>
              setValores((anteriores) => ({
                ...anteriores,
                [campo.nome]: evento.target.value,
              }))
            }
            maxLength={campo.limite}
            required={campo.obrigatorio}
            disabled={enviando}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
          />
        </div>
      ))}

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
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {enviando ? "Salvando..." : "Salvar alterações"}
        </button>

        <Link
          href={`/motos/${id}`}
          className="text-blue-600 underline"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}