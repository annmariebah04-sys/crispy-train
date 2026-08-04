@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

@import "tailwindcss";

:root {
  color-scheme: dark;
}

html, body, #root {
  height: 100%;
}

body {
  margin: 0;
  font-family: 'Manrope', system-ui, sans-serif;
  background: #0a0a12;
  color: #f2f1f8;
  -webkit-font-smoothing: antialiased;
}

.font-display {
  font-family: 'Space Grotesk', 'Manrope', system-ui, sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
}
::-webkit-scrollbar-track {
  background: transparent;
}

.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bg-noise {
  background-image: radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.15), transparent 40%),
    radial-gradient(circle at 80% 0%, rgba(45, 212, 191, 0.12), transparent 40%),
    radial-gradient(circle at 50% 100%, rgba(251, 113, 133, 0.12), transparent 45%);
}
