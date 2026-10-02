"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cadastrar } from "./actions";

export default function FormularioCadastro() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
      const resultado = await cadastrar(dados);

      setNome(resultado.valores.nome);
      setEmail(resultado.valores.email);

      if (!resultado.sucesso) {
        setErro(resultado.error);
        return;
      }

      setSucesso(true);
      setSenha("");

      router.replace("/painel");
      router.refresh();
    } catch {
      setErro("Falha na comunicação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const classeCampo =
    "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-100";

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <div>
        <label
          htmlFor="nome"
          className="mb-2 block text-sm font-medium"
        >
          Nome
        </label>

        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          disabled={enviando || sucesso}
          className={classeCampo}
        />
      </div>

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
          disabled={enviando || sucesso}
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
          autoComplete="new-password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          disabled={enviando || sucesso}
          aria-describedby="orientacaoSenha"
          className={classeCampo}
        />

        <p
          id="orientacaoSenha"
          className="mt-2 text-sm text-slate-600"
        >
          Use de 8 a 128 caracteres.
        </p>
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
          Conta criada! Abrindo seu painel...
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || sucesso}
        className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sucesso
          ? "Abrindo painel..."
          : enviando
            ? "Criando conta..."
            : "Criar conta"}
      </button>
    </form>
  );
}