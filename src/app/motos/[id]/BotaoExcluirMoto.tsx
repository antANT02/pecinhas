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
        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
      >
        Excluir moto
      </button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-red-300 p-4">
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
          className="mt-3 rounded-lg bg-red-50 p-3 text-red-800"
        >
          {erro}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={confirmarExclusao}
          disabled={excluindo}
          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}