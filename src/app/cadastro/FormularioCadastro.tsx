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
    "psCampo";

  return (
    <form onSubmit={enviar} noValidate className="psFormulario space-y-5">
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
          className="mt-2 text-sm psTextoSecundario"
        >
          Use de 8 a 128 caracteres.
        </p>
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
          Conta criada! Abrindo seu painel...
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || sucesso}
        className="w-full psBotao psPrimario"
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