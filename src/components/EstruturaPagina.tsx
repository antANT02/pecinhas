import Link from "next/link";
import type { ReactNode } from "react";

type EstruturaPaginaProps = {
  children: ReactNode;
  tipo?: "conta" | "formulario" | "painel" | "detalhes";
  etiqueta?: string;
};

export default function EstruturaPagina({
  children,
  tipo = "formulario",
  etiqueta = "ÁREA DA CONTA",
}: EstruturaPaginaProps) {
  return (
    <div className="psSistema">
      <a href="#conteudoInterno" className="psPular">Pular para o conteúdo</a>
      <header className="psCabecalho">
        <div className="psContainer">
          <Link href="/" className="psMarca" aria-label="Pecinhas — página inicial">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M7 26V6h12l6 6-6 6H7" stroke="currentColor" strokeWidth="4" />
            </svg>
            Pecinhas<span>.</span>
          </Link>
          <nav aria-label="Navegação principal" className="psNavegacao">
            <Link href="/" className="psLinkCatalogo">Catálogo</Link>
            {tipo === "conta" ? (
              <Link href="/login" className="psBotao psSecundario">Entrar</Link>
            ) : (
              <Link href="/painel" className="psBotao psSecundario">Meu painel</Link>
            )}
          </nav>
        </div>
      </header>
      <main id="conteudoInterno" className={`psContainer psConteudo psConteudo-${tipo}`}>
        {tipo === "conta" ? (
          <>
            <aside className="psApresentacao" aria-label="Sobre o Pecinhas">
              <p className="psEtiqueta">MOTOS & SERVIÇOS</p>
              <h2>Sua moto.<br />Seu histórico.<br /><span>Seu espaço.</span></h2>
              <p className="psTextoApresentacao">Uma conta para organizar suas motos e registrar cada manutenção.</p>
              <ul className="psListaRecursos">
                <li><span>01</span> Fichas com dados e fotos.</li>
                <li><span>02</span> Serviços com data e valor.</li>
                <li><span>03</span> Registros ligados à sua conta.</li>
              </ul>
              <Link href="/" className="psLink">Conhecer o catálogo →</Link>
            </aside>
            <div className="psAreaFormulario">{children}</div>
          </>
        ) : (
          <div className="psAreaConteudo">
            <p className="psEtiqueta">{etiqueta}</p>
            {children}
          </div>
        )}
      </main>
      <footer className="psRodape"><div className="psContainer">
        <span>Pecinhas<span className="psDestaque">.</span></span>
        <p>Motos e serviços. Organizados.</p>
        <Link href="/">Voltar ao catálogo</Link>
      </div></footer>
    </div>
  );
}
