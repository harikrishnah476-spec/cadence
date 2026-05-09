import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Cadence // Adaptive Rhythm Mastery',
  description: 'The premier evidence-based typing performance system. Build practical muscle memory with training that adapts to your professional cadence.',
  keywords: ['typing', 'cadence', 'rhythm', 'speed', 'accuracy', 'adaptive learning', 'deliberate practice', 'code typing'],
  authors: [{ name: 'Cadence' }],
  openGraph: {
    title: 'Cadence // Adaptive Rhythm Mastery',
    description: 'Transform your typing speed into professional productivity with evidence-based adaptive rhythm training.',
    type: 'website',
    url: 'https://cadence-typing.vercel.app', // Update with actual URL
    siteName: 'Cadence',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cadence Performance Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cadence // Adaptive Rhythm Mastery',
    description: 'The premier evidence-based typing performance system.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#050505]">
      <body className={`${inter.className} antialiased selection:bg-cyan-500/30 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
