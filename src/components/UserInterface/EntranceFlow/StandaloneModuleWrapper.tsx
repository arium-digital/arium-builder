import styles from "css/ui.module.scss";
import clsx from "clsx";
import { Col, Row, Container } from "react-bootstrap";

const StandaloneModuleWrapper = ({ children }: { children: JSX.Element }) => {
  return (
    <div className={styles.userInterface}>
      <div className={styles.onboarding}>
        <Container fluid className={clsx(styles.container, "vh-100 mx-0 px-0")}>
          <Col className="vh-100 mx-0 px-0">
            <Row className={"justify-content-center vh-100 mx-0 px-0"}>
              <Col
                xs={12}
                md={8}
                lg={6}
                xl={4}
                className="align-self-md-center"
                style={{ position: "relative" }}
              >
                {children}
              </Col>
            </Row>
          </Col>
        </Container>
      </div>
    </div>
  );
};

export default StandaloneModuleWrapper;
