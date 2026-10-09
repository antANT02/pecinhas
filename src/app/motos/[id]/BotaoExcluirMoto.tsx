"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { excluirMoto } from "./actions";

type BotaoExcluirMotoProps = {
  id: string;
};

export default function BotaoExcluirMoto({
  id,
}: BotaoExcluirMotoProps) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmarExclusao() {
    if (excluindo) return;

    setErro("");
    setExcluindo(true);

    try {
      const resultado = await excluirMoto(id);

      if (!resultado.sucesso) {
        setErro(resultado.error);
        setExcluindo(false);
        return;
      }

      router.replace("/painel");
      router.refresh();
    } catch {
      setErro("Não foi possível enviar o pedido. Tente novamente.");
      setExcluindo(false);
    }
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="psBotao psPerigo"
      >
        Excluir moto
      </button>
    );
  }

  return (
    <div className="w-full psConfirmacao">
      <p className="font-semibold">
        Deseja excluir esta moto?
      </p>

      <p className="mt-2 text-sm">
        A exclusão é permanente. Os serviços ligados à moto também
        serão excluídos.
      </p>

      {erro && (
        <p
          role="alert"
          className="mt-3 psAviso psErro"
        >
          {erro}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={confirmarExclusao}
          disabled={excluindo}
          className="psBotao psPerigo"
        >
          {excluindo ? "Excluindo..." : "Sim, excluir moto"}
        </button>

        <button
          type="button"
          onClick={() => {
            setConfirmando(false);
            setErro("");
          }}
          disabled={excluindo}
          className="border px-4 py-2 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}