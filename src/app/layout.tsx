import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nosana Mastra Agent Kit",
  description: "An example of using CopilotKit with Mastra agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ScrollProgress />
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="weatherAgent"
          publicApiKey="ck_pub_ddccb58c6c87ae6d3bf709669ab0fb97"
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
