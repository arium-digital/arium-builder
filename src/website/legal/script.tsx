import { useEffect } from "react";

const Script = () => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://app.termly.io/embed-policy.min.js";
    script.async = true;

    document.body.appendChild(script);
  }, []);
  return null;
};

export default Script;
