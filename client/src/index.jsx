import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./css/index.scss";
import Login from "./routes/login";
import Editor from "./routes/editor";
import ErrorPage from "./routes/error";

export const SERVER_URL = '192.168.1.3'
// DEV ONLY
// export const SERVER_URL = 'localhost'

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
