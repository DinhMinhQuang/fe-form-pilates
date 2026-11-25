import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function config(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      trailingSlash: true,
      async rewrites() {
        return [{
          source: "/auth/magic/:token/",
          destination: "/auth/magic/?token=:token",
        }];
      },
    };
  }

  return {
    output: "export",
    trailingSlash: true,
  };
}
