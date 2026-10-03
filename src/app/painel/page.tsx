import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BotaoSair from "./BotaoSair";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    redirect("/login");
  }

  const motos = await prisma.moto.findMany({
    where: {
      userId: sessao.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      marca: true,
      modelo: true,
      ano: true,
      placa: true,
      cor: true,
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">Painel Pecinhas</h1>

          <p className="mt-2 break-words">
            Olá, {sessao.user.name}!
          </p>

          <p className="break-all text-sm text-gray-600">
            {sessao.user.email}
          </p>
        </div>

        <BotaoSair />
      </header>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">
            Minhas motos ({motos.length})
          </h2>

          <Link
            href="/motos/nova"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Cadastrar moto
          </Link>
        </div>

        {motos.length === 0 ? (
          <div className="mt-6 rounded-lg border p-6">
            <p>Você ainda não cadastrou nenhuma moto.</p>

            <p className="mt-2 text-sm text-gray-600">
              Clique em “Cadastrar moto” para começar.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {motos.map((moto) => (
              <li
                key={moto.id}
                className="min-w-0 rounded-lg border p-5"
              >
                <h3 className="break-words text-xl font-semibold">
                  {moto.marca} {moto.modelo}
                </h3>

                <dl className="mt-4 space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Ano</dt>
                    <dd>{moto.ano}</dd>
                  </div>

                  <div>
                    <dt className="text-sm text-gray-600">Placa</dt>
                    <dd className="break-words">
                      {moto.placa || "Não informada"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm text-gray-600">Cor</dt>
                    <dd className="break-words">
                      {moto.cor || "Não informada"}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/motos/${moto.id}`}
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Ver detalhes
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}