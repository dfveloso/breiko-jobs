export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>No hemos podido cargar la página</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #0A1222; color: #fff; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #D5DCE8; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 999px; min-height: 48px; font-weight: 600; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #fff; color: #0A1222; }
      .secondary { background: transparent; color: #fff; border: 1.5px solid #fff; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>No hemos podido cargar la página</h1>
      <p>Algo ha fallado. Prueba a recargar o vuelve al inicio.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Reintentar</button>
        <a class="secondary" href="/">Volver al inicio</a>
      </div>
    </div>
  </body>
</html>`;
}
