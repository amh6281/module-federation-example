import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import dts from "vite-plugin-dts";
import tailwindcss from "@tailwindcss/vite";

// Tailwind CSS 클래스명에 ! 붙이는 커스텀 플러그인
function addImportantToTailwindClasses() {
  return {
    name: "add-important-to-tailwind",
    transform(code: string, id: string) {
      if (id.endsWith(".tsx")) {
        // className 속성 내의 Tailwind 클래스들에 ! 붙이기
        const modifiedCode = code.replace(
          /className\s*=\s*{?[\s\n]*["'`]([^"'`]+)["'`][\s\n]*}?/g,
          (match, classNameString) => {
            // 이미 !가 붙은 클래스는 제외하고 Tailwind 클래스들에 ! 붙이기
            const classes = classNameString
              .split(/\s+/)
              .map((cls: string) => {
                // 빈 문자열이거나 이미 !가 붙은 클래스는 그대로 반환
                if (!cls || cls.startsWith("!")) return cls;

                // Tailwind CSS 클래스 패턴 체크 (색상, 크기, 간격, 레이아웃 등)
                const isTailwindClass =
                  /^(bg-|text-|border-|p-|m-|w-|h-|flex|grid|hidden|block|inline|absolute|relative|fixed|static|top-|bottom-|left-|right-|z-|opacity-|rounded|shadow|hover:|focus:|active:|disabled:|transition|duration|ease|transform|scale|rotate|translate|skew|origin|select|cursor|pointer-events|resize|appearance|outline|ring|divide|space|gap|justify|items|content|self|order|grow|shrink|basis|overflow|truncate|whitespace|break|hyphens|list|table|flow|place|auto-cols|auto-rows|col|row|col-start|col-end|row-start|row-end|col-span|row-span|start|end|span|min|max|font|text|leading|tracking|indent|align|vertical|decoration|underline|overline|line-through|no-underline|uppercase|lowercase|capitalize|normal-case|truncate|text-ellipsis|text-clip|visible|invisible|backdrop-blur|backdrop-brightness|backdrop-contrast|backdrop-grayscale|backdrop-hue-rotate|backdrop-invert|backdrop-opacity|backdrop-saturate|backdrop-sepia)/.test(
                    cls
                  );

                return isTailwindClass ? `${cls}!` : cls;
              })
              .join(" ");

            return match.replace(classNameString, classes);
          }
        );

        return modifiedCode !== code ? { code: modifiedCode } : null;
      }
      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "http://localhost:4001/remote/",
  build: {
    target: "chrome89",
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    addImportantToTailwindClasses(), // Tailwind 클래스에 ! 붙이는 플러그인
    dts({
      outDir: "dist",
      tsconfigPath: "./tsconfig.app.json",
      include: ["src/**/*"],
    }),
    federation({
      name: "remote",
      filename: "remoteEntry.js",
      exposes: {
        "./RemoteApp": "./src/App.tsx",
      },
      shareStrategy: "loaded-first",
      shared: {
        react: {
          singleton: true,
          requiredVersion: "18.2.0",
          version: "18.2.0",
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "18.2.0",
          version: "18.2.0",
        },
      },
    }),
  ],
});
