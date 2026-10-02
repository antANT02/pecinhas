import Link from "next/link";

export default function PaginaInicial() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <p className="font-semibold text-orange-700">
          Pecinhas
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          Suas motos e manutenções organizadas
        </h1>

        <p className="mt-3 text-slate-600">
          Cadastre suas motos e acompanhe os serviços de manutenção.
        </p>

        <nav className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="rounded-lg border border-orange-600 px-5 py-3 font-semibold text-orange-700 hover:bg-orange-50"
          >
            Criar conta
          </Link>

          <Link
            href="/painel"
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-100"
          >
            Meu painel
          </Link>
        </nav>
      </section>
    </main>
  );
}