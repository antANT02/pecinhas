import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import estilos from "./inicio.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type PaginaInicialProps = { searchParams: Promise<{ busca?: string | string[] }> };

function Seta({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">{diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h16m-6-6 6 6-6 6" />}</svg>;
}
function Simbolo() {
  return <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 26V6h12l6 6-6 6H7" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter" /></svg>;
}

export default async function PaginaInicial({ searchParams }: PaginaInicialProps) {
  const parametros = await searchParams;
  const parametroBusca = Array.isArray(parametros.busca) ? parametros.busca[0] : parametros.busca;
  const busca = (parametroBusca || "").trim().slice(0, 120);
  const motos = await prisma.moto.findMany({
    where: busca ? { OR: [
      { marca: { contains: busca, mode: "insensitive" } },
      { modelo: { contains: busca, mode: "insensitive" } },
      { cor: { contains: busca, mode: "insensitive" } },
    ] } : {},
    orderBy: { createdAt: "desc" },
    select: { id: true, marca: true, modelo: true, ano: true, cor: true, imagemUrl: true },
  });
  const motoDestaque = motos.find((moto) => moto.imagemUrl);
  return (
    <div className={estilos.pagina}>
      <a href="#conteudo" className={estilos.pular}>Pular para o conteúdo</a>
      <header className={estilos.cabecalho}><div className={estilos.container}>
        <Link href="/" className={estilos.marca} aria-label="Pecinhas — página inicial"><span className={estilos.simbolo}><Simbolo /></span>Pecinhas<span className={estilos.ponto}>.</span></Link>
        <nav aria-label="Navegação principal" className={estilos.navegacao}><a href="#catalogo" className={estilos.linkCatalogo}>Motos</a><Link href="/login">Entrar</Link><Link href="/painel" className={estilos.botaoPainel}>Meu painel <Seta diagonal /></Link></nav>
      </div></header>
      <main id="conteudo">
        {!busca && <>
          <section className={`${estilos.container} ${estilos.hero}`} aria-labelledby="tituloPrincipal">
            <div className={estilos.heroTexto}>
              <p className={estilos.etiqueta}><span /> GESTÃO DE MOTOS & SERVIÇOS</p>
              <h1 id="tituloPrincipal">Sua moto.<br />Cada serviço.<br /><span>Tudo no lugar.</span></h1>
              <p className={estilos.descricao}>Da primeira revisão à próxima manutenção. Organize suas motos, registre os serviços e mantenha o histórico por perto.</p>
              <div className={estilos.acoesHero}><Link href="/cadastro" className={estilos.botaoPrimario}>Criar minha conta <Seta /></Link><a href="#catalogo" className={estilos.botaoTexto}>Explorar motos <Seta diagonal /></a></div>
              <p className={estilos.notaHero}>Já usa o Pecinhas? <Link href="/painel">Acesse seu painel.</Link></p>
            </div>
            <div className={estilos.heroVisual}>
              <div className={estilos.rotuloImagem}><span>{motoDestaque ? "NO CATÁLOGO" : "SUA PRÓXIMA MOTO"}</span><span>PECINHAS / MOTOS</span></div>
              {motoDestaque?.imagemUrl ? <Image src={motoDestaque.imagemUrl} alt={`${motoDestaque.marca} ${motoDestaque.modelo}, moto cadastrada no Pecinhas`} width={900} height={900} unoptimized preload className={estilos.imagemHero} /> : <div className={estilos.heroSemFoto}><Simbolo /><span>O próximo registro<br />começa com sua moto.</span><Link href="/cadastro">Começar <Seta /></Link></div>}
              <div className={estilos.legendaHero}><div><span className={estilos.microTexto}>REGISTRO DO CATÁLOGO</span><p>{motoDestaque ? `${motoDestaque.marca} ${motoDestaque.modelo}` : "Sua moto, seu histórico"}</p></div><span className={estilos.anoHero}>{motoDestaque?.ano ?? "01"}</span></div>
            </div>
          </section>
          <section className={estilos.faixaRecursos} aria-label="Recursos do Pecinhas"><div className={estilos.container}>
            {[["01", "Ficha da moto", "Marca, modelo, ano e foto."], ["02", "Histórico de serviços", "Registros com data e valor."], ["03", "Controle por conta", "Cada usuário gerencia suas motos."]].map(([numero, titulo, descricao]) => <div key={numero} className={estilos.recurso}><span>{numero}</span><div><h2>{titulo}</h2><p>{descricao}</p></div></div>)}
          </div></section>
        </>}
        <section id="catalogo" className={`${estilos.container} ${estilos.catalogo}`} aria-labelledby="tituloResultados">
          <div className={estilos.tituloCatalogo}><div><p className={estilos.etiqueta}>CATÁLOGO PÚBLICO</p><h2 id="tituloResultados">{busca ? "Resultado da busca" : "Motos da oficina"}<span className={estilos.ponto}>.</span></h2></div><p>Conheça as motos cadastradas.<br />Os serviços ficam no painel de cada conta.</p></div>
          <form key={busca} action="/#catalogo" method="GET" className={estilos.busca}>
            <label htmlFor="busca" className={estilos.labelBusca}>Encontre uma moto</label>
            <div className={estilos.controlesBusca}><div className={estilos.campoBusca}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input id="busca" name="busca" type="search" defaultValue={busca} maxLength={120} placeholder="Marca, modelo ou cor" /></div><button type="submit" className={estilos.botaoPrimario}>Buscar <Seta /></button>{busca && <Link href="/#catalogo" className={estilos.botaoLimpar}>Limpar</Link>}</div>
          </form>
          <div className={estilos.resumoResultados}><p>{busca ? <>Busca por <strong>“{busca}”</strong></> : "TODOS OS REGISTROS"}</p><span>{motos.length} {motos.length === 1 ? "moto encontrada" : "motos encontradas"}</span></div>
          {motos.length === 0 ? <div className={estilos.vazio}><span className={estilos.etiqueta}>NENHUM REGISTRO</span><h3>{busca ? "Não encontramos essa moto." : "O catálogo começa aqui."}</h3><p>{busca ? "Tente outra marca, modelo ou cor." : "Crie sua conta e cadastre a primeira moto."}</p>{busca ? <Link href="/#catalogo" className={estilos.botaoTexto}>Ver todas as motos <Seta /></Link> : <Link href="/cadastro" className={estilos.botaoPrimario}>Criar minha conta <Seta /></Link>}</div> :
            <ul className={estilos.gradeMotos}>{motos.map((moto) => <li key={moto.id} className={estilos.cartaoMoto}>
              <div className={estilos.fotoMoto}>{moto.imagemUrl ? <Image src={moto.imagemUrl} alt={`Foto da moto ${moto.marca} ${moto.modelo}`} width={600} height={450} unoptimized className={estilos.imagemMoto} /> : <div className={estilos.semFoto}><Simbolo /><span>Foto ainda não cadastrada</span></div>}<span className={estilos.seloAno}>{moto.ano}</span></div>
              <div className={estilos.fichaMoto}><p className={estilos.microTexto}>{moto.marca}</p><h3>{moto.modelo}</h3><dl><div><dt>ANO</dt><dd>{moto.ano}</dd></div><div><dt>COR</dt><dd>{moto.cor || "Não informada"}</dd></div></dl></div>
            </li>)}</ul>}
        </section>
        {!busca && <section className={`${estilos.container} ${estilos.comoFunciona}`} aria-labelledby="tituloComoFunciona">
          <div className={estilos.tituloProcesso}><p className={estilos.etiqueta}>DO CADASTRO AO HISTÓRICO</p><h2 id="tituloComoFunciona">Menos informação solta.<br />Mais organização.</h2></div>
          <ol className={estilos.etapas}><li><span>01 / CADASTRE</span><h3>Uma ficha para cada moto.</h3><p>Adicione os dados e uma foto. Encontre seus registros no painel.</p></li><li><span>02 / REGISTRE</span><h3>O serviço fica registrado.</h3><p>Informe o que foi feito, a data e o valor, tudo ligado à moto.</p></li><li><span>03 / CONSULTE</span><h3>Seu histórico, por perto.</h3><p>Entre na sua conta para consultar as motos e os serviços cadastrados.</p></li></ol>
          <div className={estilos.chamadaFinal}><p>Comece pela sua próxima moto.</p><Link href="/cadastro" className={estilos.botaoPrimario}>Criar minha conta <Seta /></Link></div>
        </section>}
      </main>
      <footer className={estilos.rodape}><div className={estilos.container}><Link href="/" className={estilos.marca}><span className={estilos.simbolo}><Simbolo /></span>Pecinhas<span className={estilos.ponto}>.</span></Link><p>Motos e serviços. Organizados.</p><nav aria-label="Navegação do rodapé"><Link href="/login">Entrar</Link><Link href="/cadastro">Criar conta</Link></nav></div></footer>
    </div>
  );
}
