import React from "react";
import { Button } from "../../../ui/src/components/atoms/Button";

export const HomePage: React.FC = () => {
  return (
    <div style={{ padding: 16 }}>
      <h1>Home (Web)</h1>
      <Button onClick={() => alert("clicked")}>Click me</Button>
    </div>
  );
};

export default HomePage;
