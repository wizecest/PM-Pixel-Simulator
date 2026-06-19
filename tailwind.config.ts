import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: "#10131f",
          panel: "#17211e",
          panel2: "#202536",
          border: "#4f5d4b",
          text: "#f1ead4",
          muted: "#b7c0b0",
          yellow: "#f4cf5d",
          cyan: "#50d7d3",
          red: "#f06a5f",
          green: "#78c96a",
          orange: "#f2a15d",
        },
      },
      fontFamily: {
        pixel: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      boxShadow: {
        pixel: "4px 4px 0 #05070c",
        pixelSm: "2px 2px 0 #05070c",
      },
    },
  },
  plugins: [],
};

export default config;
