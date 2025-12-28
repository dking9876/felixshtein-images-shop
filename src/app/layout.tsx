import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Felix Shtein | Wall Art & Prints",
  description: "Premium wall art prints on canvas, metal, wood, and more. Transform your space with unique artwork.",
  keywords: ["wall art", "prints", "canvas", "home decor", "artwork", "Felix Shtein"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Detect RTL for Hebrew
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>
            <CartProvider>
              <div className="app-wrapper">
                <Header />
                <main className="main-content">
                  {children}
                </main>
                <Footer />
              </div>
            </CartProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
