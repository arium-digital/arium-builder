import css from "styled-jsx/css";

const globalStyles = css.global`
  html {
    position: relative;
    min-height: 100%;
  }

  html,
  body {
    height: 100%;
    font-family: $primary-font;
  }

  #__next {
    width: 100%;
    height: 100%;
  }

  body {
    font-size: 16px;
    font-weight: 400;
    line-height: 25px;
    color: $arium-black;
    font-family: $primary-font;
    background-color: $arium-black !important;
  }

  h1,
  h2,
  h3 {
    font-family: $primary-font;
    color: $arium-black;
  }

  h1 {
    font-weight: bold;
    font-size: 48px;
  }

  h2 {
    font-weight: 600;
    font-size: 40px;
  }

  a {
    font-family: $primary-font;
    text-decoration: underline;
    color: $arium-red;
    font-size: 16px;
  }
`;

export default globalStyles;
