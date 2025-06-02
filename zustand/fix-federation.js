// TODO: fix-react-injection.js에서 try/catch 제거?

import fs from "fs";
import path from "path";

const distDir = path.resolve("./dist");

function fixFederationFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixFederationFiles(filePath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf8");

      // requireReact()를 importShared()로 교체
      if (content.includes("requireReact()")) {
        // importShared 변수 선언 추가
        content = content.replace(
          /(var\s+__federation_method_importShared\s*=\s*[^;]+;)/,
          "$1\nvar __federation_shared_react = null;"
        );

        // requireReact() 호출을 importShared() 호출로 교체
        content = content.replace(
          /var React = requireReact\(\);/g,
          'var React = (function() { if (!__federation_shared_react) { __federation_shared_react = __federation_method_importShared("react"); } return __federation_shared_react; })();'
        );

        // async 함수로 감싸기
        if (
          !content.includes("async function") &&
          !content.includes("async ()")
        ) {
          content = content.replace(/(function\s*\([^)]*\)\s*\{)/g, "async $1");
        }

        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
      }
    }
  });
}

fixFederationFiles(distDir);
