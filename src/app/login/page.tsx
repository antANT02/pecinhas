import EstruturaPagina from "@/components/EstruturaPagina";
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
    <EstruturaPagina tipo="conta">
      <section className="psBlocoFormulario">
        <p className="psEtiqueta">ACESSO À CONTA</p>

        <h1 className="mt-5 text-3xl font-bold">
          Entre na sua conta
        </h1>

        <p className="mb-6 mt-2 psTextoSecundario">
          Acesse suas motos e seus serviços.
        </p>

        <FormularioLogin />

        <p className="mt-6 text-sm psTextoSecundario">
          Ainda não tem conta?{" "}
          <Link
            href="/cadastro"
            className="psLink"
          >
            Cadastre-se
          </Link>
        </p>
      </section>
    </EstruturaPagina>
  );
}