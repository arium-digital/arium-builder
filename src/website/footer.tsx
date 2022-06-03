import { Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className={"footer mt-auto py-3 border-top"}>
      <Row>
        <Col>
          <small className={"d-block mb-3 text-muted"}>
            &copy; 2021 Arium Virtual Technologies Inc. &nbsp;&nbsp;&nbsp;
            <a className={"text-muted"} href="/privacy">
              Privacy
            </a>
            &nbsp;&nbsp;&nbsp;
            <a className={"text-muted"} href="/terms">
              Terms
            </a>{" "}
          </small>
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;
