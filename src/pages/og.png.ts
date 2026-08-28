import type { APIRoute } from "astro";
export const prerender = true;

export const GET: APIRoute = () =>
  new Response(null, {
    status: 308,
    headers: { Location: "/astropaper-og.jpg" },
  });
