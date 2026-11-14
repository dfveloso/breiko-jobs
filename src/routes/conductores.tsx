import { createFileRoute, Outlet } from "@tanstack/react-router";
import { validarBusquedaVitrina } from "@/lib/vitrina";

export const Route = createFileRoute("/conductores")({
  validateSearch: validarBusquedaVitrina,
  component: Outlet,
});
