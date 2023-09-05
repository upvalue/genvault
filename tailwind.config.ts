import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      "night",
      {
        protocol: {
          "primary": "#10B981", // emerald-500
          "secondary": "#06b6d4", // cyan-500
          "accent": "#2dd4bf", // teal-400
          "neutral": "#2a323c", // ??
          "base-100": "#18181b", // ??
          "info": "#06b6d4", // zinc-900
          "success": "#10b981", // emerald-500
          "warning": "#f97316", // orange-500
          "error": "#ef4444", // red-500
        },
      },
    ],
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
