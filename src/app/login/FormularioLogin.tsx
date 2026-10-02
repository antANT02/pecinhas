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
    "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-100";

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
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
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}