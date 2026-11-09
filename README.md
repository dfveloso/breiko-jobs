# Breiko Jobs

Vamos a crear jobs.breikobreiko.com, la web de Breiko Jobs: el producto de empleo para conductores profesionales del ecosistema Breiko Breiko (la matriz es breikobreiko.com y hay otras webs hermanas: app., fleet., insights.). Es una PRIMERA VERSIÓN de una sola página para captar el interés de la comunidad antes del lanzamiento. Adjunto el logo (blanco para fondos oscuros, oscuro para claros).

MUY IMPORTANTE sobre el contenido: no expliques cómo funcionará el servicio por dentro (ni procesos de selección, ni modelo de contratación, ni precios, ni quién contrata a quién). Solo la promesa, en pocas líneas, y un botón para apuntarse. Nada de cifras de ofertas, empresas ni testimonios: todavía no existen.

## Página única (/)
1. Cabecera común del ecosistema (ver sistema de diseño): «Breiko Breiko / Jobs», desplegable Productos, enlace Empresa (https://breikobreiko.com/empresa) y botón principal «Me interesa» que baja al formulario.
2. Hero oscuro, acento violeta (#A78BFA) con halo sutil. Etiqueta «Próximamente». Titular: «Empleo para conductores profesionales». Subtítulo: «Muy pronto, ofertas de trabajo de conducción dentro de Breiko Breiko, la app que ya usan miles de camioneros en España. Apúntate y serás de los primeros en enterarte.» Botón grande «Me interesa». Debajo, en pequeño: «Gratis para conductores».
3. Tres tarjetas breves (fondo claro), sin detallar procesos:
   - «Ofertas pensadas para ti»: según tu zona, tu tipo de vehículo y tus permisos.
   - «Dentro de la app que ya usas»: sin portales genéricos ni formularios eternos.
   - «Tú decides»: tu perfil solo lo ven las empresas si tú quieres.
4. Bloque «¿Buscas conductores?» (oscuro, pequeño): «Si eres una empresa y necesitas conductores, apúntate también y te contaremos las novedades.» con botón que abre el mismo formulario con «Soy empresa» preseleccionado.
5. Formulario «Me interesa» (anclado en #me-interesa, también abrible como modal desde los botones): selector de dos opciones grandes «Soy conductor» / «Soy empresa»; correo (obligatorio); nombre (opcional); provincia (desplegable con las provincias de España, opcional); si es empresa, nombre de la empresa (opcional); casilla obligatoria «He leído la política de privacidad» con enlace a https://breikobreiko.com/politica-privacidad; casilla opcional «Quiero recibir novedades de Breiko Breiko por correo». Al enviar: mensaje de confirmación «¡Apuntado! Te avisaremos en cuanto Breiko Jobs esté disponible.» y botones para descargar la APP (Google Play y App Store).
   - Guarda las respuestas en una tabla de la base de datos de Lovable Cloud (interes_jobs: id, creado, perfil conductor/empresa, correo, nombre, provincia, empresa, acepta_privacidad, acepta_novedades, origen = parámetro utm_source si viene en la URL). Seguridad: el público solo puede INSERTAR (RLS), nadie puede leer desde la web. Evita duplicados por correo+perfil (si ya existe, muestra igualmente la confirmación). Validación del correo y límite de longitud de los campos. Sin captcha por ahora, pero añade un campo trampa oculto (honeypot) contra bots.
   - Bajo el botón, en letra pequeña: «Responsable: Breiko Breiko Apps, S.L. Usaremos tus datos solo para avisarte del lanzamiento de Breiko Jobs y, si lo marcas, enviarte novedades. Puedes pedir su borrado en canal19@breikobreiko.com.»
6. Pie común del ecosistema.

SEO: title «Breiko Jobs · Empleo para conductores profesionales», description acorde, Open Graph, lang="es".

# Sistema de diseño común · Ecosistema Breiko Breiko (no cambiar sin pedirlo)

Cinco webs comparten este sistema: breikobreiko.com (matriz), app.breikobreiko.com (APP), fleet.breikobreiko.com (Fleet), insights.breikobreiko.com (Insights) y jobs.breikobreiko.com (Jobs). Deben parecer una misma familia: mismo menú, misma tipografía, mismos componentes, cambia solo el color de acento de cada producto.

## Estilo
- Moderno, tecnológico y sobrio, tipo producto SaaS actual (Linear, Vercel, Stripe), cercano al transporte por carretera. Mucho aire, rejilla limpia, jerarquía clara.
- Secciones alternando fondo oscuro de marca y fondo claro. Hero oscuro.
- Animaciones discretas y rápidas (150–250 ms). Prioridad absoluta a que cargue rápido.
- Nunca fotos de personas inventadas ni testimonios.

## Colores (tokens)
- Fondo oscuro #0B1220; superficie oscura #13213A; borde oscuro #1F2C44
- Fondo claro #F7F9FC; superficie clara #FFFFFF; borde claro #E3E8F0
- Texto sobre oscuro #F1F5F9 (secundario #A9B8CC); sobre claro #0F172A (secundario #475569)
- Azul corporativo (botones principales, enlaces) #1565D8; degradado #4F8FEA → #1565D8
- Acentos: APP #4F8FEA · Fleet #10B981 · Insights #FBBF24 · Jobs #A78BFA (este proyecto)
- Contraste AA mínimo.

## Tipografía
- Inter (Google Fonts); titulares Inter 800, tracking -0,02 em. Escala 64/48/32/22/18/16 px; fluida en móvil.

## Componentes comunes
- Cabecera fija translúcida con desenfoque al hacer scroll: «Breiko Breiko / Jobs» (logo de la matriz enlazando a https://breikobreiko.com + nombre del producto), desplegable «Productos» con 4 tarjetas (APP https://app.breikobreiko.com · Fleet https://fleet.breikobreiko.com · Insights https://insights.breikobreiko.com · Jobs), enlace «Empresa» y botón principal.
- Pie: columnas Productos (las 4 webs), Empresa (Sobre nosotros https://breikobreiko.com/empresa, Contacto https://breikobreiko.com/contacto), Legal (Aviso legal, Política de privacidad, Política de cookies, Accesibilidad, Términos de uso, Solicitud de baja: https://breikobreiko.com/aviso-legal, /politica-privacidad, /politica-cookies, /accesibilidad, /terminos-de-uso, /solicitud-de-baja), descarga de la APP y «© 2026 Breiko Breiko Apps, S.L. · CIF B02736890 · Camariñas (A Coruña)».
- Botones radio 12 px; tarjetas radio 20 px con borde fino.
- Aviso de cookies: solo almacenamiento técnico; enlace a https://breikobreiko.com/politica-cookies.
- Accesible (semántica, foco visible, etiquetas en formularios).

## Tono
- Español de España, directo, tuteo. Nada de cifras ni promesas inventadas.

## Enlaces fijos
- Google Play: https://play.google.com/store/apps/details?id=com.hyliaapps.breiko
- App Store: https://apps.apple.com/es/app/breiko-breiko/id1545359744
- Contacto: canal19@breikobreiko.com

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://breiko-jobs.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ab6d2c81-0b95-49f3-9f75-8c15b37a07d2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
