// reserve 버전

// fix-react-injection.js

import fs from "fs/promises";
import path from "path";

const distDir = "./dist"; // 환경에 맞게 조정
const injectedVar = "React$to_replace_requirereact";

const isFederationExposeFile = (filename) =>
  filename.startsWith("__federation_expose_") && filename.endsWith(".js");

async function patchReactInjection() {
  try {
    const versions = await fs.readdir(distDir);

    await Promise.all(
      versions.map(async (version) => {
        const versionPath = path.join(distDir, version);
        const files = await fs.readdir(versionPath);

        await Promise.all(
          files.filter(isFederationExposeFile).map(async (file) => {
            const filePath = path.join(versionPath, file);
            let content = await fs.readFile(filePath, "utf-8");

            // 이미 패치된 경우 스킵
            if (content.includes(`var ${injectedVar}`)) {
              console.log(`[SKIP] Already patched: ${file}`);
              return;
            }

            // requireReact() → 변환
            const updatedContent = content.replace(
              /requireReact\(\)/g,
              injectedVar
            );

            // importShared 삽입
            const importLine = `var ${injectedVar} = await importShared('react');\n`;
            const withImport = updatedContent.replace(
              /(import.*?;)/s,
              `$1\n${importLine}`
            );

            await fs.writeFile(filePath, withImport, "utf-8");
            console.log(`[FIXED] Patched file: ${file}`);
          })
        );
      })
    );
  } catch (error) {
    console.error("❌ Error while patching:", error);
  }
}

patchReactInjection();
