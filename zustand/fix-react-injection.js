// fix-react-injection.js

import fs from "fs";
import path from "path";

// 빌드 결과물 디렉토리
const distDir = path.resolve("./dist");

// 패치될 변수 이름
const injectedVar = "React$to_replace_requirereact";

// 특정 파일이 Federation에서 expose된 파일인지 여부 판별하는 함수
const isFederationExposeFile = (filename) =>
  filename.startsWith("__federation_expose_") && filename.endsWith(".js");

/**
 * 주어진 디렉토리 내 모든 파일에 대해 requireReact를 importShared('react') 방식으로 패치
 * 재귀적으로 하위 디렉토리도 순회
 *
 * @param {string} dir - 대상 디렉토리 경로
 */
function patchReactInjection(dir) {
  // 해당 디렉토리 내 파일 목록 읽기
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // 하위 디렉토리인 경우 재귀 호출
    if (stat.isDirectory()) {
      patchReactInjection(filePath);
    }
    // federation expose된 .js 파일인 경우
    else if (isFederationExposeFile(file)) {
      // 파일 내용을 문자열로 읽기
      let content = fs.readFileSync(filePath, "utf-8");

      // 이미 패치된 경우 (같은 변수명이 존재하면) 건너뛰기
      if (content.includes(`var ${injectedVar}`)) {
        console.log(`[SKIP] Already patched: ${file}`);
        return;
      }

      /**
       * 1단계: requireReact() → React$to_replace_requirereact 로 문자열 대체
       */
      const updatedContent = content.replace(/requireReact\(\)/g, injectedVar);

      /**
       * 2단계: importShared 코드 삽입
       * `var React$to_replace_requirereact = await importShared('react');`
       * 해당 줄을 기존 import 구문 뒤에 삽입
       *
       * (import문이 끝나는 첫 줄 이후 위치에 삽입)
       */
      const importLine = `var ${injectedVar} = await importShared('react');\n`;
      const withImport = updatedContent.replace(
        /(import.*?;)/s, // 첫 번째 import 구문 찾기
        `$1\n${importLine}` // 그 다음 줄에 삽입
      );

      // 파일을 덮어쓰기 (수정된 내용 저장)
      fs.writeFileSync(filePath, withImport, "utf-8");
      console.log(`[FIXED] Patched file: ${file}`);
    }
  });
}

// 시작 함수 호출: dist 디렉토리에서부터 패치 시작
patchReactInjection(distDir);
