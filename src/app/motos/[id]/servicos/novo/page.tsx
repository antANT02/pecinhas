import EstruturaPagina from "@/components/EstruturaPagina";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FormularioServico from "./FormularioServico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NovoServicoProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NovoServicoPage({
  params,
}: NovoServicoProps) {
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
    },
  });

  if (!moto) {
    notFound();
  }

  return (
    <EstruturaPagina tipo="formulario" etiqueta="DADOS & REGISTROS">
      <Link
        href={`/motos/${moto.id}`}
        className="psLink"
      >
        Voltar aos detalhes
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Cadastrar serviço</h1>

      <p className="mt-2 break-words">
        Moto: {moto.marca} {moto.modelo}
      </p>

      <p className="mt-2 text-sm psTextoSecundario">
        Os campos com * são obrigatórios.
      </p>

      <FormularioServico motoId={moto.id} />
    </EstruturaPagina>
  );
}