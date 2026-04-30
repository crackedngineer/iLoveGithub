import type {Metadata} from "next";
import {cache} from "react";
import {getBlogPostBySlug} from "@/services/blog";
import BlogPostClient from "./BlogPostClient";

const SITE_URL = "https://ilovegithub.vercel.app";

type Props = {params: Promise<{slug: string}>};

/* Deduplicate within a single request — generateMetadata + page share one fetch */
const getPost = cache(getBlogPostBySlug);

const fallbackMetadata: Metadata = {
  title: "Blog Post | iLoveGithub",
  description: "Read the latest insights and tutorials on the iLoveGithub Engineering Blog.",
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params;
  try {
    const post = await getPost(slug);
    if (!post) return fallbackMetadata;

    const images = post.coverImage
      ? [{url: post.coverImage, width: 1200, height: 630, alt: post.title}]
      : [{url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "iLoveGithub Blog"}];

    return {
      title: `${post.title} | iLoveGithub Blog`,
      description: post.description || post.excerpt || "",
      authors: post.author ? [{name: post.author}] : undefined,
      keywords: post.tags,
      alternates: {
        canonical: `${SITE_URL}/blog/${slug}`,
      },
      openGraph: {
        title: post.title,
        description: post.description || post.excerpt || "",
        type: "article",
        url: `${SITE_URL}/blog/${slug}`,
        siteName: "iLoveGithub",
        images,
        publishedTime: post.created,
        authors: post.author ? [post.author] : undefined,
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description || post.excerpt || "",
        images: post.coverImage ? [post.coverImage] : [`${SITE_URL}/og-image.png`],
      },
    };
  } catch {
    return fallbackMetadata;
  }
}

export default async function BlogPostPage({params}: Props) {
  const {slug} = await params;

  let post = null;
  try {
    post = await getPost(slug);
  } catch {
    /* JSON-LD omitted on error — page still renders via client component */
  }

  const articleJsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description || post.excerpt,
        ...(post.coverImage ? {image: post.coverImage} : {}),
        datePublished: post.created,
        dateModified: post.created,
        author: {
          "@type": "Person",
          name: post.author || "iLoveGithub Team",
        },
        publisher: {
          "@type": "Organization",
          name: "iLoveGithub",
          logo: {"@type": "ImageObject", url: `${SITE_URL}/icons/favicon.png`},
        },
        url: `${SITE_URL}/blog/${slug}`,
        keywords: post.tags.join(", "),
        mainEntityOfPage: {"@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}`},
      }
    : null;

  const breadcrumbJsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {"@type": "ListItem", position: 1, name: "Home", item: SITE_URL},
          {"@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog`},
          {"@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}`},
        ],
      }
    : null;

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(articleJsonLd)}}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbJsonLd)}}
        />
      )}
      <BlogPostClient />
    </>
  );
}
