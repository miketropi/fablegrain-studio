import type { Metadata } from "next";
import "@ui-sdk/core/web.css";
import "./globals.css";
export const metadata: Metadata = { title: "Fablegrain Studio", description: "Build worlds. Craft stories. Bring them to life." };
export default function Layout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
