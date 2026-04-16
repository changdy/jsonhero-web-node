export type Theme = "dark" | "light";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && ["light", "dark"].includes(value);
}

export type ToastMessage = {
  message: string;
  title: string;
  type: "success" | "error";
  id: string;
};

export type PreviewImage = {
  url: string;
  contentType: "image" | "gif";
  mimeType: string;
  size?: number;
};

export type PreviewVideo = {
  url: string;
  contentType: "video";
  mimeType: string;
  size?: number;
};

export type PreviewHtml = {
  url: string;
  contentType: "html";
  mimeType: string;
  title?: string;
  description?: string;
  name?: string;
  icon?: { url: string };
  image?: { url: string; alt?: string };
};

export type PreviewJson = {
  url: string;
  contentType: "json";
  json: unknown;
};

export type PreviewResult =
  | PreviewImage
  | PreviewVideo
  | PreviewHtml
  | PreviewJson
  | { error: string };

export type OpenGraphPreviewData = {
  hostname: string;
  requestUrl: string;
  title: string;
  description: string;
  image?: {
    url: string;
    alt?: string;
  };
  details: { favicon?: string };
};

export type OpenGraphPreviewDataError = {
  error: string;
};
