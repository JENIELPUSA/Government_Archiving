/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Poppins"],
            },
            screens: {
                "2xs": { max: "320px" },
                xs: { min: "321px", max: "360px" },
                "xs-max": { min: "361px", max: "430px" },
                "custom-3xs":{ min: "431px", max: "639px" },
                xm: "640px",
                "lg-custom": "1024px",
            },
        },
    }

};
