import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaginaInicialProps = {
  searchParams: {
    busca?: string | string[];
  };
};

export default async function PaginaInicial({
  searchParams,
}: PaginaInicialProps) {
  const parametros = await searchParams;

  const parametroBusca = Array.isArray(parametros.busca)
    ? parametros.busca[0]
    : parametros.busca;

  const busca = (parametroBusca || "").trim().slice(0, 120);

  const motos = await prisma.moto.findMany({
    where: busca
      ? {
          OR: [
            {
              marca: {
                contains: busca,
                mode: "insensitive",
              },
            },
            {
              modelo: {
                contains: busca,
                mode: "insensitive",
              },
            },
            {
              cor: {
                contains: busca,
                mode: "insensitive",
              },
            },
          ],
        }
      : {},
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      marca: true,
      modelo: true,
      ano: true,
      cor: true,
      imagemUrl: true,
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-3xl font-bold">
          Pecinhas
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex flex-wrap gap-4"
        >
          <Link href="/login" className="text-blue-600 underline">
            Entrar
          </Link>

          <Link href="/cadastro" className="text-blue-600 underline">
            Criar conta
          </Link>

          <Link href="/painel" className="text-blue-600 underline">
            Meu painel
          </Link>
        </nav>
      </header>

      <section className="mt-10">
        <h1 className="text-3xl font-bold">Motos da oficina</h1>

        <p className="mt-3">
          Conheça as motos cadastradas no Pecinhas. Crie uma conta
          para organizar suas motos e registrar os serviços.
        </p>

        <form action="/" method="GET" className="mt-6">
          <label htmlFor="busca" className="mb-2 block font-medium">
            Buscar por marca, modelo ou cor
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="busca"
              name="busca"
              type="search"
              defaultValue={busca}
              maxLength={120}
              placeholder="Ex.: Honda, Fazer ou vermelha"
              className="min-w-0 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Buscar
            </button>

            {busca && (
              <Link
                href="/"
                className="rounded-lg border px-5 py-3 text-center"
              >
                Limpar
              </Link>
            )}
          </div>
        </form>
      </section>

      <section className="mt-8" aria-labelledby="tituloResultados">
        <h2
          id="tituloResultados"
          className="break-words text-2xl font-semibold"
        >
          {busca ? `Resultados para “${busca}”` : "Motos cadastradas"}
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {motos.length}{" "}
          {motos.length === 1 ? "moto encontrada" : "motos encontradas"}
        </p>

        {motos.length === 0 ? (
          <p className="mt-6 rounded-lg border p-5">
            {busca
              ? "Nenhuma moto encontrada. Tente outra marca, modelo ou cor."
              : "Ainda não há motos cadastradas."}
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {motos.map((moto) => (
              <li
                key={moto.id}
                className="min-w-0 overflow-hidden rounded-lg border"
              >
                {moto.imagemUrl ? (
                  <Image
                    src={moto.imagemUrl}
                    alt={`Foto da moto ${moto.marca} ${moto.modelo}`}
                    width={600}
                    height={400}
                    unoptimized
                    className="h-52 w-full bg-gray-100 object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-600">
                    Foto ainda não cadastrada
                  </div>
                )}

                <div className="p-5">
                  <h3 className="break-words text-xl font-semibold">
                    {moto.marca} {moto.modelo}
                  </h3>

                  <p className="mt-3">Ano: {moto.ano}</p>

                  <p className="mt-2 break-words">
                    Cor: {moto.cor || "Não informada"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}