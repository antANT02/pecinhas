import EstruturaPagina from "@/components/EstruturaPagina";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import FormularioCadastro from "./FormularioCadastro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PaginaCadastro() {
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
          Crie sua conta
        </h1>

        <p className="mb-6 mt-2 psTextoSecundario">
          Organize suas motos e seus serviços de manutenção.
        </p>

        <FormularioCadastro />

        <p className="mt-6 text-sm psTextoSecundario">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="psLink"
          >
            Entre
          </Link>
        </p>
      </section>
    </EstruturaPagina>
  );
}