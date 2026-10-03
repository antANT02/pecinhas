import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DetalhesMotoProps = {
  params: {
    id: string;
  };
};

export default async function DetalhesMotoPage({
  params,
}: DetalhesMotoProps) {
  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    redirect("/login");
  }

  const moto = await prisma.moto.findFirst({
    where: {
      id: params.id,
      userId: sessao.user.id,
    },
    select: {
      marca: true,
      modelo: true,
      ano: true,
      placa: true,
      cor: true,
      descricao: true,
    },
  });

  if (!moto) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <Link
        href="/painel"
        className="text-blue-600 underline"
      >
        Voltar ao painel
      </Link>

      <h1 className="mt-6 break-words text-3xl font-bold">
        {moto.marca} {moto.modelo}
      </h1>

      <dl className="mt-6 space-y-4 rounded-lg border p-5">
        <div>
          <dt className="font-semibold">Marca</dt>
          <dd className="break-words">{moto.marca}</dd>
        </div>

        <div>
          <dt className="font-semibold">Modelo</dt>
          <dd className="break-words">{moto.modelo}</dd>
        </div>

        <div>
          <dt className="font-semibold">Ano</dt>
          <dd>{moto.ano}</dd>
        </div>

        <div>
          <dt className="font-semibold">Placa</dt>
          <dd className="break-words">
            {moto.placa || "Não informada"}
          </dd>
        </div>

        <div>
          <dt className="font-semibold">Cor</dt>
          <dd className="break-words">
            {moto.cor || "Não informada"}
          </dd>
        </div>

        <div>
          <dt className="font-semibold">Descrição</dt>
          <dd className="whitespace-pre-wrap break-words">
            {moto.descricao || "Nenhuma descrição informada."}
          </dd>
        </div>
      </dl>
    </main>
  );
}