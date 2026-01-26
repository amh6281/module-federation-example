import { Agentation, type Annotation, loadAnnotations } from "agentation";
import { useEffect, useRef } from "react";

function App() {
  const appliedStylesRef = useRef<Map<string, HTMLElement>>(new Map());

  // 주석 내용을 파싱해서 스타일을 적용하는 함수
  const applyStyleFromComment = (annotation: Annotation) => {
    const comment = annotation.comment.toLowerCase();
    const elementPath = annotation.elementPath;

    // 요소 선택자로 DOM 요소 찾기
    let targetElement: HTMLElement | null = null;

    try {
      // elementPath를 사용해서 요소 찾기 (예: "#root > div")
      if (elementPath) {
        // CSS 선택자로 변환 시도
        const selector = elementPath
          .replace(/>/g, " > ")
          .replace(/\s+/g, " ")
          .trim();

        // 간단한 경우 직접 찾기
        if (selector.includes("#root")) {
          const root = document.getElementById("root");
          if (root) {
            // #root > div 같은 경우
            const parts = selector.split(">").map((s) => s.trim());
            if (parts.length === 2 && parts[1] === "div") {
              targetElement = root.querySelector("div") || root;
            } else {
              targetElement = root;
            }
          }
        }
      }

      // 백그라운드 색상 적용
      if (comment.includes("백그라운드") || comment.includes("background")) {
        const colorMatch = comment.match(
          /(red|빨강|blue|파랑|green|초록|yellow|노랑|black|검정|white|흰색)/i,
        );
        if (colorMatch && targetElement) {
          const color = colorMatch[1].toLowerCase();
          const colorMap: Record<string, string> = {
            red: "red",
            빨강: "red",
            blue: "blue",
            파랑: "blue",
            green: "green",
            초록: "green",
            yellow: "yellow",
            노랑: "yellow",
            black: "black",
            검정: "black",
            white: "white",
            흰색: "white",
          };

          const bgColor = colorMap[color] || color;
          targetElement.style.backgroundColor = bgColor;

          // 적용된 스타일 추적
          appliedStylesRef.current.set(annotation.id, targetElement);

          console.log(
            `✅ 스타일 적용됨: ${elementPath}에 background-color: ${bgColor}`,
          );
        }
      }
    } catch (error) {
      console.error("스타일 적용 실패:", error);
    }
  };

  // 저장된 주석들을 불러와서 스타일 적용
  useEffect(() => {
    const savedAnnotations = loadAnnotations(window.location.pathname);
    savedAnnotations.forEach((annotation) => {
      applyStyleFromComment(annotation);
    });
  }, []);

  // 주석이 추가될 때 호출되는 콜백
  const handleAnnotation = (annotation: Annotation) => {
    console.log("새 주석 추가됨:", {
      element: annotation.element,
      comment: annotation.comment,
      elementPath: annotation.elementPath,
    });

    // 주석 추가 시 즉시 스타일 적용
    applyStyleFromComment(annotation);
  };

  // 주석이 삭제될 때 호출되는 콜백
  const handleAnnotationDelete = (annotation: Annotation) => {
    console.log("주석 삭제됨:", annotation.id);
  };

  // 주석이 수정될 때 호출되는 콜백
  const handleAnnotationUpdate = (annotation: Annotation) => {
    console.log("주석 수정됨:", annotation.id, annotation.comment);
  };

  // 모든 주석이 삭제될 때 호출되는 콜백
  const handleAnnotationsClear = (annotations: Annotation[]) => {
    console.log("모든 주석 삭제됨:", annotations.length);
  };

  // 복사 버튼 클릭 시 호출되는 콜백 (마크다운 형식)
  const handleCopy = (markdown: string) => {
    console.log("마크다운 복사됨:", markdown);
  };

  return (
    <>
      <div>Host Application</div>
      {/* 개발 환경에서만 Agentation 도구 표시 */}
      {import.meta.env.DEV && (
        <Agentation
          onAnnotationAdd={handleAnnotation}
          onAnnotationDelete={handleAnnotationDelete}
          onAnnotationUpdate={handleAnnotationUpdate}
          onAnnotationsClear={handleAnnotationsClear}
          onCopy={handleCopy}
          copyToClipboard={true} // 복사 버튼 클릭 시 클립보드에 자동 복사
        />
      )}
    </>
  );
}
export default App;
