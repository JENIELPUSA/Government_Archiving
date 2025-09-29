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
                // 320px and below
                "2xs": { max: "320px" },

                // 321px to 360px
                xs: { min: "321px", max: "360px" },

                // 361px to 430px
                "xs-max": { min: "361px", max: "430px" },

                // 640px and above
                xm: "640px",
                "lg-custom": "1024px",
            },
        },
    }

};
