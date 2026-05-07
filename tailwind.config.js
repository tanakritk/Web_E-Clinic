/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // colors: {
    //     primary: "#003663",
    //     white: "#fff",
    //     black: "#000",
    //     secondary: "#9a9a9a",
    //     orange: "#eabc3f",
    //     sidebar: "#d4d4d4",
        
    //     "gray-100": "#f1b9b9",
    // },
    extend: {
        colors: {
            // primary: "#2c9a9b",
            primary: "#E91E63",
            "primary-1": "#C84C69",
            white: "#ffffff",
            black: "#000000",
            secondary: "#C84C69",
            orange: "#eabc3f",
            sidebar: "#d4d4d4",
            warning: "#ed6c02",
            error: "#ff0000",
            info: "#1ba3d6",
            success: "#008C47",
        },
    },
  },
  plugins: [],
}

