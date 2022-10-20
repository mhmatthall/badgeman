import React from "react";
import { useRouteError } from "react-router-dom";
import "../css/index.scss";

export default function ErrorPage() {
  const err = useRouteError();
  console.error(err);

  return (
    <div id="error-page">
      <h1>Uhoh!</h1>
      <p>An error has occurred. Please tell Matt :)</p>
      <p>{err.statusText || err.message}</p>
    </div>
  );
}
