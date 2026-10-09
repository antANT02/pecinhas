"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sair } from "./actions";

export default function BotaoSair() {
  const router = useRouter();

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function encerrarSessao() {
    if (enviando) {
      return;
    }

    setEnviando(true);
    setErro("");

    try {
      const resultado = await sair();

      if (!resultado.sucesso) {
        setErro(resultado.error);
        setEnviando(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setErro("Falha na comunicação. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={encerrarSessao}
        disabled={enviando}
        className="psBotao psSecundario"
      >
        {enviando ? "Saindo..." : "Sair"}
      </button>

      {erro && (
        <p
          role="alert"
          className="mt-3 psAviso psErro"
        >
          {erro}
        </p>
      )}
    </div>
  );
}