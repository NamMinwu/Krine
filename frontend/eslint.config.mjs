import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // RULES.md 자동 집행: 컴포넌트(.tsx)에서 API 직접 호출 금지 (규칙 3·8)
    // API 접근은 domains의 쿼리 훅 또는 _hooks의 오케스트레이션 훅을 통해서만.
    // 우회가 필요하면 코드를 쓰기 전에 먼저 물어볼 것 (RULES.md '규칙 우회 절차').
    files: ["src/app/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/domains/decision/api",
              message:
                "컴포넌트에서 API를 직접 호출하지 마세요 (RULES 3·8). domains/decision/queries의 훅이나 _hooks를 사용하세요. 우회가 필요하면 먼저 물어보세요.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
