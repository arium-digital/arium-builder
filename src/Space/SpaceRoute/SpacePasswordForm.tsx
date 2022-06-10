import React, { useCallback, useMemo } from "react";
import styles from "website/css/flow.module.scss";
import { Row, Col, Form, Button } from "react-bootstrap";
import * as yup from "yup";
import { Formik } from "formik";
import { functions } from "db";
// import { hashPassword } from "libs/passwords";

const validatePassword = async (spaceId: string, password: string) => {
  const result = await functions().httpsCallable("validatePassword")({
    spaceId,
    password,
  });

  return result.data as boolean;
};

const SpacePasswordForm = ({
  spaceId,
  setPasswordValidated,
}: {
  spaceId: string;
  setPasswordValidated: (validated: boolean) => void;
}) => {
  const onSubmit = useCallback(() => {
    setPasswordValidated(true);
  }, [setPasswordValidated]);

  const schema = useMemo(() => {
    return yup.object({
      // lowercase letters or strings
      password: yup
        .string()
        .required()
        .test("validatePassword", "invalid password", async (value) => {
          if (!value) return false;
          //   const hashedPassword = hashPassword(value as string);
          return validatePassword(spaceId, value as string);
        }),
    });
  }, [spaceId]);

  return (
    <div className={styles.jumbotronPadding}>
      <div className="text-center">
        <h3>Please enter the password to access this space</h3>
      </div>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6} lg={4}>
          <Formik
            validationSchema={schema}
            onSubmit={onSubmit}
            validateOnChange={false}
            initialValues={{
              password: "",
            }}
          >
            {({ handleSubmit, handleChange, isSubmitting, values, errors }) => (
              <Form noValidate className={styles.form} onSubmit={handleSubmit}>
                <Form.Group controlId="password">
                  <Form.Control
                    type={"password"}
                    name="password"
                    placeholder="space password"
                    value={values.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                </Form.Group>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </div>
  );
};

export default SpacePasswordForm;
