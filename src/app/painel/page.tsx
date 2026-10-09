import EstruturaPagina from "@/components/EstruturaPagina";
import Link from "next/link";
import Image from "next/image";
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
      imagemUrl: true,
    },
  });

  return (
    <EstruturaPagina tipo="painel" etiqueta="SEU ESPAÇO / MOTOS">
      <header className="psCabecalhoPainel flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">Painel Pecinhas</h1>

          <p className="mt-2 break-words">
            Olá, {sessao.user.name}!
          </p>

          <p className="break-all text-sm psTextoSecundario">
            {sessao.user.email}
          </p>
        </div>

        <BotaoSair />
      </header>

      <section className="psSecaoMotos">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">
            Minhas motos ({motos.length})
          </h2>

          <Link
            href="/motos/nova"
            className="psBotao psPrimario"
          >
            Cadastrar moto
          </Link>
        </div>

        {motos.length === 0 ? (
          <div className="psEstadoVazio mt-6">
            <p>Você ainda não cadastrou nenhuma moto.</p>

            <p className="mt-2 text-sm psTextoSecundario">
              Clique em “Cadastrar moto” para começar.
            </p>
          </div>
        ) : (
          <ul className="psGradePainel">
            {motos.map((moto) => (
              <li
                key={moto.id}
                className="psCartaoPainel"
              >
                {moto.imagemUrl ? (
                  <Image
                    src={moto.imagemUrl}
                    alt={`Foto da moto ${moto.marca} ${moto.modelo}`}
                    width={600}
                    height={450}
                    unoptimized
                    className="psFotoPainel"
                  />
                ) : (
                  <div className="psSemFotoPainel">
                    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <path d="M7 26V6h12l6 6-6 6H7" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <span>Foto ainda não cadastrada</span>
                  </div>
                )}
                <div className="psDadosPainel">
                  <p className="psEtiqueta">{moto.marca}</p>
                  <h3>{moto.modelo}</h3>

                  <dl className="psDadosFicha">
                    <div>
                      <dt className="text-sm psTextoSecundario">Ano</dt>
                      <dd>{moto.ano}</dd>
                    </div>

                    <div>
                      <dt className="text-sm psTextoSecundario">Placa</dt>
                      <dd className="break-words">
                        {moto.placa || "Não informada"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm psTextoSecundario">Cor</dt>
                      <dd className="break-words">
                        {moto.cor || "Não informada"}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/motos/${moto.id}`}
                    className="psBotao psPrimario"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </EstruturaPagina>
  );
}