import { Outlet } from "react-router-dom";
import { Aside } from "../components/Aside";

export function PageLayout() {
  return (
    <div className="flex w-full h-full">
      <Aside />

      {/*
        Mobile primeiro: a coluna ocupa a tela inteira com respiro lateral e a
        Aside reaparece à esquerda a partir de `md`.
      */}
      <div className="flex flex-col w-full px-4 md:w-11/12 md:ml-9 md:mr-20 md:px-0">
        <Outlet />

        {/*
          O respiro do fim da página precisa ser um ELEMENTO, não `padding` nem
          `margin` da coluna.

          `#root` e esta coluna têm altura travada em 100% da janela, então numa
          página longa o conteúdo transborda a caixa: o padding fica lá na marca
          dos 100vh e o que passa dela é desenhado por fora, encostando no fim
          do documento. Um bloco vazio, ao contrário, é conteúdo — ele entra no
          transbordo junto e empurra o fim da rolagem.

          No celular a altura também cobre a barra de navegação fixa do rodapé.
        */}
        <div aria-hidden className="h-28 shrink-0 md:h-16" />
      </div>

      {/*
        Fora da coluna de conteúdo: a faixa é fixa e ocupa a largura da janela,
        então aninhá-la ali só escondia a relação entre a altura dela e o
        respiro reservado acima. `h-10` casa com o `md:pb-12` da coluna e com o
        `pb-12` da Aside.
      */}
      <footer className="hidden md:flex fixed bottom-0 left-0 z-10 h-10 w-full items-center border-t border-gray-600/40 bg-white">
        <div className="font-semibold px-2 text-[17px]">
          Developed by <span className="font-bold">DevLand®</span>
        </div>
      </footer>
    </div>
  );
}
