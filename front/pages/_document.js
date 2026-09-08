// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 본문 폰트 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/pretendard.min.css"
        />
        {/* 아이콘 폰트 (프레임워크가 아니라 순수 아이콘 세트라 CDN 유지) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        {/* Bootstrap 5 프레임워크 CSS/JS는 package.json에 설치돼 있는 npm 패키지를
            pages/_app.js에서 import 하므로 여기서 CDN으로 중복 로드하지 않습니다. */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
