import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FormularioFoto from "./FormularioFoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FotoMotoProps = {
  params: {
    id: string;
  };
};

export default async function FotoMotoPage({
  params,
}: FotoMotoProps) {
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
      id: true,
      marca: true,
      modelo: true,
    },
  });

  if (!moto) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8">
      <Link
        href={`/motos/${moto.id}`}
        className="text-blue-600 underline"
      >
        Voltar aos detalhes
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Foto da moto</h1>

      <p className="mt-2 break-words">
        {moto.marca} {moto.modelo}
      </p>

      <p className="mt-2 text-sm text-gray-600">
        Enviar uma nova foto substitui a foto exibida nesta moto.
      </p>

      <FormularioFoto motoId={moto.id} />
    </main>
  );
}