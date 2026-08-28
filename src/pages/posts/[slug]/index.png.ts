import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { slugifyStr } from "@utils/slugify";

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection("blog").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map(post => ({
    params: { slug: slugifyStr(post.data.title) },
    props: post,
  }));
}

export const GET: APIRoute = () =>
  new Response(null, {
    status: 308,
    headers: { Location: "/astropaper-og.jpg" },
  });
