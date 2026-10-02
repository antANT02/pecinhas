import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import FormularioMoto from "./FormularioMoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PaginaNovaMoto() {
  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto w-full min-w-0 max-w-xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <Link
          href="/painel"
          className="text-sm font-semibold text-orange-700"
        >
          Voltar ao painel
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          Cadastrar moto
        </h1>

        <p className="mb-6 mt-2 text-slate-600">
          Preencha os dados da moto. Marca, modelo e ano são obrigatórios.
        </p>

        <FormularioMoto />
      </section>
    </main>
  );
}