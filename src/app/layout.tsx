import type { Metadata } from "next";
import "./globals.css";
import type { Viewport } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Visual GPX",
  description: "Visual GPX",
  icons: { icon: "/vercel.svg" },
  openGraph: {
    title: "Visual GPX",
    description: "Visual GPX",
    images: [
      {
        url: "/gpx-track2.png",
        width: 500,
        height: 500,
        alt: "Visual GPX",
      },
    ],
  },
};

export const viewport: Viewport = { maximumScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`no-scrollbar overflow-x-clip antialiased`}>
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-gray-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/">
                <div className="flex flex-row items-center">
                  <span className="text-xl font-semibold text-gray-50">
                    Visual GPX{" "}
                  </span>
                  <p className="ml-2 mt-0.5 inline rounded bg-gray-50 px-2 text-sm !text-gray-950 font-black">
                    BETA
                  </p>
                </div>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/strava"
                  className="rounded-md text-xs sm:text-base bg-gray-50 px-4 py-2 text-gray-700 hover:bg-lime-500 animation-all duration-500"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-950 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div className="mb-6 md:mb-0">
                <h3 className="text-lg font-bold text-gray-50">Visual GPX</h3>
                <p className="text-sm text-gray-200">Transform your adventure into art</p>
              </div>
              <div className="flex space-x-6">
                <Link href="#" className="text-sm text-gray-100 hover:text-gray-200">
                  About
                </Link>
                <Link href="#" className="text-sm text-gray-100 hover:text-gray-200">
                  Contact
                </Link>
                <Link href="#" className="text-sm text-gray-100 hover:text-gray-200">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
