            /** @type {import('tailwindcss').Config} */
            module.exports = {
              darkMode: 'class', // Enable dark mode based on 'dark' class
              content: [
                "./index.html", // Now in root
                "./src/**/*.{js,ts,jsx,tsx}",
              ],
              theme: {
                extend: {
                  fontFamily: {
                    inter: ['Inter', 'sans-serif'],
                  },
                  colors: {
                    // Custom colors inspired by image_39d320.png
                    'dark-bg-start': '#1A002C', // Deep purple
                    'dark-bg-end': '#0D001F',   // Even deeper purple/black
                    'dark-gradient-purple': '#5A189A', // Vibrant purple
                    'dark-gradient-pink': '#FF0080',   // Electric pink
                    'dark-gradient-blue': '#00BFFF',   // Bright blue

                    'light-accent-blue': '#007bff',    // Standard light blue
                    'light-accent-purple': '#8a2be2',  // Medium purple
                    'light-accent-pink': '#FF69B4',    // Medium pink

                    // Golds/Yellows for specific accents (if any in light mode, or for glowing effects)
                    'accent-gold': '#FFD700',
                    'accent-yellow': '#FFEA00',

                    // Grays for text and subtle elements, adjusted for new themes
                    'text-dark-light': '#E0E0E0', // Light text on dark bg
                    'text-light-dark': '#333333', // Dark text on light bg
                  },
                  keyframes: {
                    'fade-in': {
                      '0%': { opacity: '0' },
                      '100%': { opacity: '1' },
                    },
                    'slide-in-right': {
                      '0%': { transform: 'translateX(100%)', opacity: '0' },
                      '100%': { transform: 'translateX(0)', opacity: '1' },
                    },
                    'pulse-border': {
                      '0%, 100%': { borderColor: 'rgba(0, 191, 255, 0.7)', boxShadow: '0 0 10px rgba(0, 191, 255, 0.4)' }, // dark-gradient-blue
                      '50%': { borderColor: 'rgba(255, 0, 128, 1)', boxShadow: '0 0 20px rgba(255, 0, 128, 0.8)' }, // dark-gradient-pink
                    },
                    'scale-in': {
                      '0%': { transform: 'scale(0.95)', opacity: '0' },
                      '100%': { transform: 'scale(1)', opacity: '1' },
                    },
                    'pulse-slow': { // Custom keyframe for the small pulsing dots
                        '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
                        '50%': { transform: 'scale(1.2)', opacity: '0.5' },
                    },
                  },
                  animation: {
                    'fade-in': 'fade-in 1s ease-out forwards',
                    'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
                    'pulse-border': 'pulse-border 2s infinite ease-in-out',
                    'scale-in': 'scale-in 0.3s ease-out forwards',
                    'pulse-slow': 'pulse-slow 4s infinite ease-in-out',
                  }
                },
              },
              plugins: [],
            }
            