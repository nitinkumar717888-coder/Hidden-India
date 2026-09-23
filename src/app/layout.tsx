import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-india-lime.vercel.app';

export const metadata: Metadata = {
  title: 'Hidden India — Discover the India You Weren’t Told About',
  description:
    'A searchable discovery database and practical trip-planning engine for India’s hidden, forgotten, unusual, historical, cultural, and natural destinations.',
  metadataBase: new URL(siteUrl),
  keywords: [
    'Hidden India',
    'Offbeat India',
    'Forgotten forts',
    'Ancient ruins',
    'Historical places Punjab',
    'Historical places Haryana',
    'Himachal Pradesh hidden places',
    'Chandigarh road trips',
    'Indian archaeology',
  ],
  authors: [{ name: 'Hidden India Editorial Team' }],
  openGraph: {
    title: 'Hidden India — Discover the India You Weren’t Told About',
    description:
      'A searchable discovery database and practical trip-planning engine for India’s hidden and forgotten places.',
    url: siteUrl,
    siteName: 'Hidden India',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF7F2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <div className="site-wrapper">
          <Header />
          <main id="main-content" className="site-main">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
