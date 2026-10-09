import EstruturaPagina from "@/components/EstruturaPagina";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BotaoExcluirMoto from "./BotaoExcluirMoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DetalhesMotoProps = {
  params: Promise<{
    id: string;
  }>;
};

const formatarValor = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatarData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
});

export default async function DetalhesMotoPage({
  params,
}: DetalhesMotoProps) {
  const { id } = await params;

  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    redirect("/login");
  }

  const moto = await prisma.moto.findFirst({
    where: {
      id,
      userId: sessao.user.id,
    },
    select: {
      id: true,
      marca: true,
      modelo: true,
      ano: true,
      placa: true,
      cor: true,
      descricao: true,
      imagemUrl: true,
      servicos: {
        where: {
          userId: sessao.user.id,
        },
        orderBy: [
          { dataServico: "desc" },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          titulo: true,
          descricao: true,
          dataServico: true,
          valor: true,
        },
      },
    },
  });

  if (!moto) {
    notFound();
  }

  return (
    <EstruturaPagina tipo="detalhes" etiqueta="FICHA DA MOTO / HISTÓRICO">
      <Link href="/painel" className="psLink">
        Voltar ao painel
      </Link>

      <h1 className="mt-6 break-words text-3xl font-bold">
        {moto.marca} {moto.modelo}
      </h1>

      {moto.imagemUrl ? (
        <Image
          src={moto.imagemUrl}
          alt={`Foto da moto ${moto.marca} ${moto.modelo}`}
          width={900}
          height={600}
          unoptimized
          className="psFotoDetalhe"
        />
      ) : (
        <p className="psEstadoVazio mt-6">
          Esta moto ainda não tem foto.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <Link
          href={`/motos/${moto.id}/foto`}
          className="psBotao psPrimario"
        >
          {moto.imagemUrl ? "Trocar foto" : "Adicionar foto"}
        </Link>

        <Link
          href={`/motos/${moto.id}/editar`}
          className="psBotao psPrimario"
        >
          Editar moto
        </Link>

        <BotaoExcluirMoto id={moto.id} />
      </div>

      <dl className="psFicha mt-6">
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

      <section className="psServicos">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">
            Serviços ({moto.servicos.length})
          </h2>

          <Link
            href={`/motos/${moto.id}/servicos/novo`}
            className="psBotao psPrimario"
          >
            Cadastrar serviço
          </Link>
        </div>

        {moto.servicos.length === 0 ? (
          <p className="psEstadoVazio mt-4">
            Nenhum serviço cadastrado para esta moto.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {moto.servicos.map((servico) => (
              <li
                key={servico.id}
                className="psServico min-w-0"
              >
                <h3 className="break-words text-xl font-semibold">
                  {servico.titulo}
                </h3>

                <p className="mt-2">
                  Data: {formatarData.format(servico.dataServico)}
                </p>

                <p className="psValorServico mt-2">
                  Valor: {formatarValor.format(servico.valor.toNumber())}
                </p>

                <p className="mt-3 whitespace-pre-wrap break-words">
                  {servico.descricao || "Nenhuma descrição informada."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </EstruturaPagina>
  );
}