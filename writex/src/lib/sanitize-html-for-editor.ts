const BLOCKED_TAGS = new Set(["script", "iframe", "object", "embed", "form", "input", "meta", "link"]);

const isJavascriptUrl = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("javascript:") || normalized.startsWith("data:text/html");
};

const sanitizeElement = (element: Element) => {
  const tag = element.tagName.toLowerCase();
  if (BLOCKED_TAGS.has(tag)) {
    element.remove();
    return;
  }

  [...element.attributes].forEach((attr) => {
    const name = attr.name.toLowerCase();
    const value = attr.value;

    if (name.startsWith("on")) {
      element.removeAttribute(attr.name);
      return;
    }

    if ((name === "href" || name === "src" || name === "xlink:href") && isJavascriptUrl(value)) {
      element.removeAttribute(attr.name);
    }
  });

  [...element.children].forEach((child) => sanitizeElement(child));
};

export const sanitizeHtmlForEditor = (html: string): string => {
  const trimmed = html.trim();
  if (!trimmed) return "";

  if (typeof DOMParser === "undefined") {
    return trimmed
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
      .replace(/\son\w+\s*=\s*(['"])[\s\S]*?\1/gi, "")
      .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "text/html");

  doc.querySelectorAll("script, iframe, object, embed, form, input, meta, link").forEach((node) => {
    node.remove();
  });

  [...doc.body.children].forEach((child) => sanitizeElement(child));

  const sanitized = doc.body.innerHTML.trim();
  return sanitized;
};
