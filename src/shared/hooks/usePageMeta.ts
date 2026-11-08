import { useEffect } from "react";

const SITE_NAME = "Bách Việt Cầm";

export interface PageMeta {
  title?: string;
  description?: string;
  noindex?: boolean;
}

function metaTag(name: string): HTMLMetaElement {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  return tag;
}

export function usePageMeta({ title, description, noindex }: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    const descTag = metaTag("description");
    const robotsTag = metaTag("robots");
    const previousDescription = descTag.content;
    const previousRobots = robotsTag.content;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = !canonical;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    const previousCanonical = canonical.href;

    if (title) document.title = `${title} · ${SITE_NAME}`;
    if (description) descTag.content = description;
    if (noindex) robotsTag.content = "noindex, nofollow";
    canonical.href = `${window.location.origin}${window.location.pathname}`;

    return () => {
      document.title = previousTitle;
      descTag.content = previousDescription;
      robotsTag.content = previousRobots;
      if (createdCanonical) canonical?.remove();
      else if (canonical) canonical.href = previousCanonical;
    };
  }, [title, description, noindex]);
}
