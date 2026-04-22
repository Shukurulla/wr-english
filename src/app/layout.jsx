import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Fraunces } from "next/font/google";
import { ToastContainer } from "@/components/ui/toast-container";
import { QueryProvider } from "./query-provider";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});

export const metadata = {
  title: "RW Platform",
  description: "Reading & Writing self-study platform",
};

const themeScript = `
  try {
    const t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} ${fraunces.variable} antialiased`}>
        <QueryProvider>
          {children}
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
