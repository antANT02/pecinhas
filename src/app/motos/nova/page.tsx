import EstruturaPagina from "@/components/EstruturaPagina";
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
    <EstruturaPagina tipo="formulario" etiqueta="DADOS & REGISTROS">
      <section className="psBlocoFormulario">
        <Link
          href="/painel"
          className="psLink"
        >
          Voltar ao painel
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          Cadastrar moto
        </h1>

        <p className="mb-6 mt-2 psTextoSecundario">
          Preencha os dados da moto. Marca, modelo e ano são obrigatórios.
        </p>

        <FormularioMoto />
      </section>
    </EstruturaPagina>
  );
}