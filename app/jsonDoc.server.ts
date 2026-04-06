import { LRUCache } from "lru-cache";
import { randomBytes } from "crypto";
import { customRandom } from "nanoid";
import safeFetch from "./utilities/safeFetch";
import createFromRawXml from "./utilities/xml/createFromRawXml";
import isXML from "./utilities/xml/isXML";

type BaseJsonDocument = {
  id: string;
  title: string;
  readOnly: boolean;
};

export type RawJsonDocument = BaseJsonDocument & {
  type: "raw";
  contents: string;
};

export type UrlJsonDocument = BaseJsonDocument & {
  type: "url";
  url: string;
};

export type CreateJsonOptions = {
  ttl?: number;
  readOnly?: boolean;
  injest?: boolean;
  metadata?: any;
};

export type JSONDocument = RawJsonDocument | UrlJsonDocument;

// LRU cache: max 500 entries, default TTL 24h
// Stored on global so it survives hot-reload require cache purges in development
declare global {
  var __documentsCache: LRUCache<string, string> | undefined;
}

const DOCUMENTS: LRUCache<string, string> =
  global.__documentsCache ??
  (global.__documentsCache = new LRUCache<string, string>({
    max: 500,
    ttl: 1000 * 60 * 60 * 24,
  }));

export async function createFromUrlOrRawJson(
  urlOrJson: string,
  title?: string
): Promise<JSONDocument | undefined> {
  if (isUrl(urlOrJson)) {
    return createFromUrl(new URL(urlOrJson), title);
  }

  if (isJSON(urlOrJson)) {
    return createFromRawJson("Untitled", urlOrJson);
  }

  // Wrapper for createFromRawJson to handle XML
  // TODO ? change from urlOrJson to urlOrJsonOrXml
  if (isXML(urlOrJson)) {
    return createFromRawXml("Untitled", urlOrJson);
  }
}

export async function createFromUrl(
  url: URL,
  title?: string,
  options?: CreateJsonOptions
): Promise<JSONDocument> {
  if (options?.injest) {
    const response = await safeFetch(url.href);

    if (!response.ok) {
      throw new Error(`Failed to injest ${url.href}`);
    }

    return createFromRawJson(title || url.href, await response.text(), options);
  }

  const docId = createId();

  const doc: JSONDocument = {
    id: docId,
    type: <const>"url",
    url: url.href,
    title: title ?? url.hostname,
    readOnly: options?.readOnly ?? false,
  };

  const setOptions = options?.ttl ? { ttl: options.ttl * 1000 } : {};
  DOCUMENTS.set(docId, JSON.stringify(doc), setOptions);
  console.log(`[cache] stored url doc id=${docId} size=${DOCUMENTS.size}`);

  return doc;
}

export async function createFromRawJson(
  filename: string,
  contents: string,
  options?: CreateJsonOptions
): Promise<JSONDocument> {
  const docId = createId();
  const doc: JSONDocument = {
    id: docId,
    type: <const>"raw",
    contents,
    title: filename,
    readOnly: options?.readOnly ?? false,
  };

  JSON.parse(contents);

  const setOptions = options?.ttl ? { ttl: options.ttl * 1000 } : {};
  DOCUMENTS.set(docId, JSON.stringify(doc), setOptions);
  console.log(`[cache] stored raw doc id=${docId} size=${DOCUMENTS.size}`);

  return doc;
}

export async function getDocument(
  slug: string
): Promise<JSONDocument | undefined> {
  const doc = DOCUMENTS.get(slug);
  console.log(`[cache] get id=${slug} found=${!!doc} size=${DOCUMENTS.size}`);

  if (!doc) return;

  return JSON.parse(doc);
}

export async function updateDocument(
  slug: string,
  title: string
): Promise<JSONDocument | undefined> {
  const document = await getDocument(slug);

  if (!document) return;

  const updated = { ...document, title };

  DOCUMENTS.set(slug, JSON.stringify(updated));

  return updated;
}

export async function deleteDocument(slug: string): Promise<void> {
  DOCUMENTS.delete(slug);
}

function createId(): string {
  const nanoid = customRandom(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    12,
    (bytes: number): Uint8Array => {
      return new Uint8Array(randomBytes(bytes));
    }
  );
  return nanoid();
}

function isUrl(possibleUrl: string): boolean {
  try {
    new URL(possibleUrl);
    return true;
  } catch {
    return false;
  }
}

function isJSON(possibleJson: string): boolean {
  try {
    JSON.parse(possibleJson);
    return true;
  } catch (e: any) {
    throw new Error(e.message);
  }
}
