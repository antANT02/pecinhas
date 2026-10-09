import Link from "next/link";
import EstruturaPagina from "@/components/EstruturaPagina";

export default function PaginaNaoEncontrada() {
  return (
    <EstruturaPagina etiqueta="PÁGINA NÃO ENCONTRADA">
      <section className="psPaginaAusente">
        <span className="psCodigoAusente">404</span>
        <h1>Esse registro não está disponível.</h1>
        <p>Confira o endereço ou volte ao seu painel para consultar suas motos.</p>
        <Link href="/painel" className="psBotao psPrimario">Voltar ao painel</Link>
      </section>
    </EstruturaPagina>
  );
}
