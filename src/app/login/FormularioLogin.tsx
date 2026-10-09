"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { entrar } from "./actions";

export default function FormularioLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    const dados = new FormData(evento.currentTarget);

    setEnviando(true);
    setErro("");

    try {
      const resultado = await entrar(dados);

      if (!resultado.sucesso) {
        setEmail(resultado.valores.email);
        setErro(resultado.error);
        setEnviando(false);
        return;
      }

      setSenha("");
      router.push("/painel");
      router.refresh();
    } catch {
      setErro("Falha na comunicação. Tente novamente.");
      setEnviando(false);
    }
  }

  const classeCampo =
    "psCampo";

  return (
    <form onSubmit={enviar} noValidate className="psFormulario space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          E-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          disabled={enviando}
          className={classeCampo}
        />
      </div>

      <div>
        <label
          htmlFor="senha"
          className="mb-2 block text-sm font-medium"
        >
          Senha
        </label>

        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          disabled={enviando}
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

      <button
        type="submit"
        disabled={enviando}
        className="w-full psBotao psPrimario"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}