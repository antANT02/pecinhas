"use client";

import { useState, type FormEvent } from "react";
import { cadastrarMoto } from "./actions";

const valoresIniciais = {
  marca: "",
  modelo: "",
  ano: "",
  placa: "",
  cor: "",
  descricao: "",
};

const campos = [
  {
    nome: "marca",
    titulo: "Marca",
    exemplo: "Honda",
  },
  {
    nome: "modelo",
    titulo: "Modelo",
    exemplo: "CG 160 Titan",
  },
  {
    nome: "ano",
    titulo: "Ano",
    exemplo: "2024",
  },
  {
    nome: "placa",
    titulo: "Placa — opcional",
    exemplo: "ABC1D23",
  },
  {
    nome: "cor",
    titulo: "Cor — opcional",
    exemplo: "Vermelha",
  },
] as const;

export default function FormularioMoto() {
  const [valores, setValores] = useState(valoresIniciais);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando || sucesso) {
      return;
    }

    const dados = new FormData(evento.currentTarget);

    setEnviando(true);
    setErro("");

    try {
      const resultado = await cadastrarMoto(dados);

      setValores(resultado.valores);

      if (resultado.sucesso) {
        setSucesso(true);
      } else {
        setErro(resultado.error);
      }
    } catch {
      setErro("Falha na comunicação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function cadastrarOutra() {
    setValores({ ...valoresIniciais });
    setErro("");
    setSucesso(false);
  }

  const classeCampo =
    "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-100";

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      {campos.map((campo) => (
        <div key={campo.nome}>
          <label
            htmlFor={campo.nome}
            className="mb-2 block text-sm font-medium"
          >
            {campo.titulo}
          </label>

          <input
            id={campo.nome}
            name={campo.nome}
            type="text"
            inputMode={campo.nome === "ano" ? "numeric" : undefined}
            placeholder={campo.exemplo}
            value={valores[campo.nome]}
            onChange={(evento) =>
              setValores({
                ...valores,
                [campo.nome]: evento.target.value,
              })
            }
            disabled={enviando || sucesso}
            className={classeCampo}
          />
        </div>
      ))}

      <div>
        <label
          htmlFor="descricao"
          className="mb-2 block text-sm font-medium"
        >
          Descrição — opcional
        </label>

        <textarea
          id="descricao"
          name="descricao"
          rows={4}
          value={valores.descricao}
          onChange={(evento) =>
            setValores({
              ...valores,
              descricao: evento.target.value,
            })
          }
          disabled={enviando || sucesso}
          className={classeCampo}
        />
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {erro}
        </p>
      )}

      {sucesso && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-800"
        >
          Moto cadastrada com sucesso!
        </p>
      )}

      {sucesso ? (
        <button
          type="button"
          onClick={cadastrarOutra}
          className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700"
        >
          Cadastrar outra moto
        </button>
      ) : (
        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Salvando..." : "Cadastrar moto"}
        </button>
      )}
    </form>
  );
}