import css from "styled-jsx/css";
import { primaryFont, ariumBlack, ariumCream } from "css/styleVariables";

// @ts-ignore
export default css.global`
  html,
  body {
    height: 100%;
    font-family: ${primaryFont};
    margin: 0;
    border: 0;
  }

  body {
    font-size: 16px;
    font-weight: 400;
    line-height: 25px;
    color: $arium-cream;
    font-family: ${primaryFont};
    background-color: ${ariumBlack} !important;
  }

  #__next {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-family: ${primaryFont};
    color: ${ariumCream};
  }

  h1 {
    font-weight: bold;
    font-size: 48px;
    line-height: 50px;
  }

  h2 {
    font-weight: 600;
    font-size: 40px;
  }
`;
