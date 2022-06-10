import React, { useCallback } from "react";
import styles from "website/css/flow.module.scss";
import { Row, Col, Form, Button } from "react-bootstrap";
// import { hashPassword } from "libs/passwords";

const UserIdChanged = () => {
  const handleReloadClick = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className={styles.jumbotronPadding}>
      <div className="text-center">
        <h3>
          It looks like you have either logged out or logged in. Please reload
          the page to continue.
        </h3>
      </div>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6} lg={4} className="align-self-center">
          <Form.Group>
            <Button type="submit" variant="primary" onClick={handleReloadClick}>
              Reload
            </Button>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default UserIdChanged;
