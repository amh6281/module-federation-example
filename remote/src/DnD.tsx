import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import "./global.css";

interface Task {
  id: string;
  content: string;
}

const initialTasks: Task[] = [
  { id: "1", content: "🚀 Module Federation 설정하기" },
  { id: "2", content: "📦 Zustand 상태관리 추가하기" },
  { id: "3", content: "🎨 Drag & Drop 기능 구현하기" },
  { id: "4", content: "✨ UI 개선하기" },
  { id: "5", content: "🎯 배포 준비하기" },
];

const DnD = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  return (
    <div className="p-5 max-w-[500px] m-auto bg-gray-100 rounded-lg border-2 border-gray-300">
      <h2 className="text-center mb-5 text-gray-600 text-2xl">
        🎯 할 일 목록 (드래그로 순서 변경)
      </h2>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="list-none p-0 m-0 bg-transparent rounded-8px min-h-[300px] transition-background-color 0.2s ease"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: "none",
                        padding: "16px",
                        margin: "8px 0",
                        backgroundColor: snapshot.isDragging
                          ? "#fff3e0"
                          : "#ffffff",
                        color: "#212529",
                        border: "2px solid",
                        borderColor: snapshot.isDragging
                          ? "#ff9800"
                          : "#dee2e6",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "500",
                        cursor: "grab",
                        boxShadow: snapshot.isDragging
                          ? "0 8px 16px rgba(0,0,0,0.15)"
                          : "0 2px 4px rgba(0,0,0,0.1)",
                        transform: snapshot.isDragging
                          ? "rotate(3deg)"
                          : "none",
                        transition: "all 0.2s ease",
                        ...provided.draggableProps.style,
                      }}
                    >
                      <span style={{ marginRight: "8px", opacity: 0.6 }}>
                        ⋮⋮
                      </span>
                      {task.content}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-5 p-3 bg-cyan-100 rounded-6px text-sm text-cyan-800 text-center">
        💡 팁: 항목을 드래그해서 순서를 변경해보세요!
      </div>
    </div>
  );
};

export default DnD;
