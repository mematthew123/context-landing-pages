import "server-only";
import { client } from "./client";

// Server-only: the open /brief form creates Briefs with this token. The Build Function's daily cap
// is the circuit breaker on spend.
export const writeClient = client.withConfig({
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  stega: false,
});

export const readClient = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: "published",
  stega: false,
});
