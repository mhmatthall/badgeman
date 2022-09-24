import React from "react";
import ReactDOM from "react-dom/client";
import fs from "fs";
import ini from "ini";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Import client files
import "./css/index.scss";
import Login from "./routes/login";
import Editor from "./routes/editor";
import ErrorPage from "./routes/error";

// Import INI file from project root
export const config = ini.parse(
  fs.readFileSync(__dirname + "/../../../config.ini", "utf8")
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "editor",
    element: <Editor />,
    errorElement: <ErrorPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
