import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const caja = "flex min-h-screen items-center justify-center bg-noche px-4 text-blanco";
function NotFoundComponent() {
  return (
    <main className={caja}>
      <div className="max-w-md text-center">
        <p className="prod justify-center"><i aria-hidden="true" />Breiko Jobs</p>
        <h1 className="text-[64px]">404</h1>
        <p className="mt-4 text-lg text-secundario">Esta página no existe o se ha movido.</p>
        <Link to="/" className="pill pill-primary mt-8">Volver al inicio</Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <main className={caja}>
      <div className="max-w-md text-center">
        <h1 className="text-[40px]">No hemos podido cargar la página</h1>
        <p className="mt-4 text-lg text-secundario">Algo ha fallado. Prueba a recargar o vuelve al inicio.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="pill pill-primary" onClick={() => { router.invalidate(); reset(); }}>Reintentar</button>
          <a href="/" className="pill pill-secondary">Volver al inicio</a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Breiko Jobs · Empleo para conductores profesionales" },
      { name: "description", content: "Empleo para conductores profesionales dentro de Breiko Breiko." },
      { name: "theme-color", content: "#0A1222" },
      { name: "author", content: "Breiko Breiko Apps, S.L." },
      { property: "og:site_name", content: "Breiko Jobs" },
      { property: "og:locale", content: "es_ES" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,600;100..125,800&family=IBM+Plex+Sans:wght@400;500;600&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
