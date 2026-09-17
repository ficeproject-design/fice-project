import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const decalotypeFont = localFont({
  src: [
    {
      path: "../../public/fonts/Decalotype-Regular-fix.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Decalotype-Medium-fix.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Decalotype-SemiBold-fix.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Decalotype-Bold-fix.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Decalotype-ExtraBold-fix.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Decalotype-Black-fix.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-heading",
  display: "swap",
});

const bricolageFont = localFont({
  src: [
    {
      path: "../../public/fonts/BricolageGrotesque-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/BricolageGrotesque-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/BricolageGrotesque-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/BricolageGrotesque-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/BricolageGrotesque-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fice Shoes Care | Premium Shoes, Bag & Cap Spa Free Antar-Jemput",
  description:
    "Layanan cuci dan perawatan sepatu, tas, dan topi premium dengan 100% Free Antar-Jemput area Jakarta Selatan, Tangerang Selatan, dan Tangerang. Dokumentasi foto QC Before & After transparan.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${decalotypeFont.variable} ${bricolageFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdf8f1] text-[#000000]">
        {children}
      </body>
    </html>
  );
}
