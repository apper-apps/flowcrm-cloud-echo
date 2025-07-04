/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5B47E0",
        secondary: "#8B7FE8",
        accent: "#00D4AA",
        success: "#00C896",
        warning: "#FFB547",
        error: "#FF5757",
        info: "#3B82F6",
        surface: "#FFFFFF",
        background: "#F8F9FB",
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
          muted: "#9CA3AF"
        }
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"]
      },
      animation: {
        "scale-up": "scale-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in-out",
        "slide-in": "slide-in 0.2s ease-out"
      },
      keyframes: {
        "scale-up": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "slide-in": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        }
      }
    }
  },
  plugins: []
};