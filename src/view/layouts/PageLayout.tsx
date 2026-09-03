import { Outlet } from "react-router-dom";
import { Aside } from "../components/Aside";

export function PageLayout() {
  return (
    <div className="flex w-full h-full">
      <Aside />

      {/*
        Mobile primeiro: a coluna ocupa a tela inteira com respiro lateral e
        deixa espaço embaixo para a barra de navegação fixa. A partir de `md`
        a Aside reaparece à esquerda e o layout volta ao de desktop.
      */}
      <div className="flex flex-col w-full px-4 pb-24 md:w-11/12 md:ml-9 md:mr-20 md:px-0 md:pb-0">
        <Outlet />

        <footer className="hidden md:block border bg-white bottom-0 w-full fixed -z-2">
          <div className="font-semibold px-2 text-[17px]">
            Developed by <span className="font-bold">DevLand®</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
