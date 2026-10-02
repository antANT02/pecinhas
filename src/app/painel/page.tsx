import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BotaoSair from "./BotaoSair";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PaginaPainel() {
  const sessao = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessao) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
        <p className="font-semibold text-orange-700">
          Pecinhas
        </p>

        <h1 className="mt-4 break-words text-2xl font-bold">
          Olá, {sessao.user.name}!
        </h1>

        <p className="mt-3 text-slate-600">
          Gerencie suas motos e seus serviços de manutenção.
        </p>

        <p className="mt-2 break-words text-sm text-slate-600">
          {sessao.user.email}
        </p>

        <div className="mt-6">
          <Link
            href="/motos/nova"
            className="inline-block rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Cadastrar moto
          </Link>
        </div>

        <BotaoSair />
      </section>
    </main>
  );
}