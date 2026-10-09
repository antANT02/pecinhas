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
    "psCampo";

  return (
    <form onSubmit={enviar} noValidate className="psFormulario space-y-5">
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
          className="psAviso psErro"
        >
          {erro}
        </p>
      )}

      {sucesso && (
        <p
          role="status"
          className="psAviso psSucesso"
        >
          Moto cadastrada com sucesso!
        </p>
      )}

      {sucesso ? (
        <button
          type="button"
          onClick={cadastrarOutra}
          className="w-full psBotao psPrimario"
        >
          Cadastrar outra moto
        </button>
      ) : (
        <button
          type="submit"
          disabled={enviando}
          className="w-full psBotao psPrimario"
        >
          {enviando ? "Salvando..." : "Cadastrar moto"}
        </button>
      )}
    </form>
  );
}