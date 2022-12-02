import { EnvType, load } from "ts-dotenv";

export type Env = EnvType<typeof schema>;

export const schema = {
  INSTANCE: String,
  ACCESS_TOKEN: String,
  URL_WEBHOOK: String,
  MAX_RUNS: Number,
};

export let env: Env;

export function loadEnv(): void {
  env = load(schema, `${process.cwd()}/.env`);
}
