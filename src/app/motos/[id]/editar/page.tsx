import EstruturaPagina from "@/components/EstruturaPagina";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FormularioEditarMoto from "./FormularioEditarMoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EditarMotoProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarMotoPage({
  params,
}: EditarMotoProps) {
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
    },
  });

  if (!moto) {
    notFound();
  }

  const valoresIniciais = {
    marca: moto.marca,
    modelo: moto.modelo,
    ano: String(moto.ano),
    placa: moto.placa || "",
    cor: moto.cor || "",
    descricao: moto.descricao || "",
  };

  return (
    <EstruturaPagina tipo="formulario" etiqueta="DADOS & REGISTROS">
      <Link
        href={`/motos/${moto.id}`}
        className="psLink"
      >
        Voltar aos detalhes
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Editar moto</h1>

      <p className="mt-2 text-sm psTextoSecundario">
        Os campos com * são obrigatórios.
      </p>

      <FormularioEditarMoto
        id={moto.id}
        valoresIniciais={valoresIniciais}
      />
    </EstruturaPagina>
  );
}