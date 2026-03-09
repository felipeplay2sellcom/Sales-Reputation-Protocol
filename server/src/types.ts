import type { Env } from "hono";

export interface AppEnv extends Env {
  Variables: {
    issuerDid: string;
    apiKey: string;
  };
}
