import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@fontsource/noto-serif-kr/600.css";
import "@fontsource/noto-serif-kr/700.css";
import "./globals.css";
import Providers from "./providers";
import BottomNav from "./_components/BottomNav";

export const metadata: Metadata = {
  title: "krine — 판단 일기",
  description: "매일의 선택을 판단 구조로 남기고, 반박으로 검증하고, 조건이 바뀌면 다시 꺼내는 판단 일기",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <div className="mx-auto min-h-dvh max-w-md pb-24">{children}</div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
