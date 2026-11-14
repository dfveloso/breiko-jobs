<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve existing public Jobs pages and form behavior; add new public experiences as separate typed routes.
- Keep public driver-board API DTOs and query helpers in lib/vitrina.ts; province and pagination live in validated route search so links are shareable.
- Use conductores.tsx as an Outlet/search layout and conductores.index.tsx for the board, so the assistant is a separate child page without changing public URLs.
- Keep driver-assistant API validation and conditional-question rules in lib/asistente.ts; persist only answers and navigation in sessionStorage to recover reloads without publishing search criteria.
- Measure the visible cookie notice with ResizeObserver into --cookie-reserve and clear it when hidden; first-scene padding and scroll clearance use that value to protect controls.
- Measure the form card after layout and on resize/content changes; disable desktop sticky positioning when it exceeds the space below its 112px top offset.
