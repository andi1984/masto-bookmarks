import { env, loadEnv } from "./env.js";
loadEnv();

import { login } from "masto";

export const getMastoRuntimeAsync = async () => {
  return login({
    url: env.INSTANCE as string,
    accessToken: env.ACCESS_TOKEN,
  });
};
