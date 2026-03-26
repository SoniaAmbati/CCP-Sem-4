import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#08090a",
          card: "#111418",
          border: "#1f2937",
          primary: "#10b981", // Emerald
          secondary: "#3b82f6", // Blue
          danger: "#ef4444", // Red
          muted: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
export default config;