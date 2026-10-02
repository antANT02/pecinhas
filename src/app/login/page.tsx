import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import FormularioLogin from "./FormularioLogin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PaginaLogin() {
  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessao) {
    redirect("/painel");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <section className="w-full min-w-0 max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <Link
          href="/"
          className="text-sm font-semibold text-orange-700"
        >
          Pecinhas
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          Entre na sua conta
        </h1>

        <p className="mb-6 mt-2 text-slate-600">
          Acesse suas motos e seus serviços.
        </p>

        <FormularioLogin />

        <p className="mt-6 text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-semibold text-orange-700 underline"
          >
            Cadastre-se
          </Link>
        </p>
      </section>
    </main>
  );
}