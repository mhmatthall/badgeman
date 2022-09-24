import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Import client files
import "./css/index.scss";
import Login from "./routes/login";
import Editor from "./routes/editor";
import ErrorPage from "./routes/error";

// Import babel macro for preval
import preval from "babel-plugin-preval/macro";

// Import INI file from project root
// Requires preval execution via Node because 'fs' disallowed on browser
const configLoader = preval`
  const fs = require("fs");
  const ini = require("ini");
  module.exports = ini.parse(
    fs.readFileSync(__dirname + "/../../config.ini", "utf8")
  );
`;
export const config = configLoader;

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
