export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string;
      GRAPH_JSON_API_KEY?: string;
      GRAPH_JSON_COLLECTION?: string;
      APIHERO_PROJECT_KEY?: string;
    }
  }
}
