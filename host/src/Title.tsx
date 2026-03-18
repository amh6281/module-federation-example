import { useEffect } from "react";

const Title = ({ title }: { title: string }) => {
  useEffect(() => {
    console.log("Title", title);
  });
  return <h1 className="text-2xl font-bold text-center">{title}</h1>;
};

export default Title;
