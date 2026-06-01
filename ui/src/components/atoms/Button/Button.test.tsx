import React from "react";
import { render } from "@testing-library/react";
import { Button } from "./Button";

test("renders button children", () => {
  const { getByText } = render(<Button>Hola</Button>);
  expect(getByText("Hola")).toBeTruthy();
});
