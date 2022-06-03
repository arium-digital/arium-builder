import Layout from "./layout";
import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import {
  useAuthentication,
  buildConfig,
} from "../hooks/auth/useAuthentication";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import { store, User, auth } from "db";
import { useRouter } from "next/router";

const SpacesView = ({ user }: { user: User }) => {
  const router = useRouter();

  const [spaceIds, setSpaceIds] = useState<string[]>([]);

  const joinSpace = ({ spaceId }: { spaceId: string }) => {
    router.push(`/spaces/${spaceId}`);
  };

  useEffect(() => {
    const newSpaceIds: string[] = [];
    // get all spaces for given user:
    store
      .collection("spaces")
      .where("ownerId", "==", user.uid)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log("doc:", doc.id);
          newSpaceIds.push(doc.id);
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
        });
      })
      .then(() => {
        setSpaceIds(newSpaceIds);
      })
      .catch(function (error) {
        console.log("Error getting documents: ", error);
      });
  }, [user]);

  return (
    <Col>
      <Row className={"account-section-title"}>
        <h2 className={"eyebrow"}>Your Spaces</h2>
        <br />
      </Row>
      <Row className={"account-section-content"}>
        {spaceIds.map((spaceId) => {
          return (
            <Card>
              <Card.Img variant="top" src="images/space-previews/home.png" />
              <Card.Body>
                <Card.Text>{spaceId}</Card.Text>
              </Card.Body>
              <Button
                onClick={() => {
                  joinSpace({ spaceId });
                }}
              >
                Join this space!
              </Button>
            </Card>
          );
        })}

        {spaceIds.length === 0 && <h2>Get your space</h2>}
      </Row>
    </Col>
  );
};

const updateProfile = async ({ user, name }: { user: User; name: string }) => {
  await store.collection("users").doc(user.uid).set({
    displayName: name,
  });
};

const Login = () => {
  const uiConfig = useMemo(() => buildConfig(), []);

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />;
};

const LogoutButton = () => {
  const handleLogout = useCallback(async () => {
    await auth().signOut();
  }, []);

  return (
    <Col>
      <Row>
        <Button onClick={handleLogout}>Logout</Button>
      </Row>
    </Col>
  );
};

// function UpdateProfileForm({ user }: { user: User }) {
//   const [isLoading, setLoading] = useState(false);
//   const displayNameRef = useRef<any>(null);

//   useEffect(() => {
//     if (isLoading && displayNameRef.current && user) {
//       const name = displayNameRef.current.value;
//       updateProfile({ user, name }).then(() => {
//         setLoading(false);
//       });
//     }
//   }, [isLoading, user]);

//   const handleClick = () => setLoading(true);

//   return (
//     <Form>
//       <Form.Group controlId="formGroupDisplayName">
//         <Form.Label>Display Name</Form.Label>
//         <Form.Control ref={displayNameRef} placeholder="Randy Newman" />
//       </Form.Group>

//       <Button
//         variant="primary"
//         disabled={isLoading}
//         onClick={
//           !isLoading
//             ? handleClick
//             : () => {
//                 return undefined;
//               }
//         }
//       >
//         {isLoading ? "Saving..." : "Save Profile"}
//       </Button>
//     </Form>
//   );
// }

const PlanView = ({ user }: { user: User }) => {
  return (
    <Col>
      <Row className={"account-section-title"}>
        <h2 className={"eyebrow"}>Your Plan</h2>
      </Row>
      <Row className={"account-section-content"}>Beta Plan!</Row>
    </Col>
  );
};

const AccountView = ({ user }: { user: User }) => {
  const [isLoading, setLoading] = useState(false);
  const displayNameRef = useRef<any>(null);

  useEffect(() => {
    if (isLoading && displayNameRef.current && user) {
      const name = displayNameRef.current.value;
      updateProfile({ user, name }).then(() => {
        setLoading(false);
      });
    }
  }, [isLoading, user]);

  const handleClick = () => setLoading(true);

  return (
    <>
      {user && (
        <Col>
          <Row className={"account-section-title"}>
            <h2 className={"eyebrow"}>Your Profile</h2>
          </Row>
          <Row className={"account-section-content"}>
            <Col sm={6}>
              <Form>
                <Form.Group as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={4}>
                    Display Name
                  </Form.Label>
                  <Col sm={8}>
                    <Form.Control
                      type="displayName"
                      placeholder={
                        user.displayName
                          ? user.displayName
                          : "Your Display Name"
                      }
                      ref={displayNameRef}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId="email">
                  <Form.Label column sm={4}>
                    Your Email
                  </Form.Label>
                  <Col sm={8}>
                    <Form.Control
                      readOnly
                      plaintext
                      type="email"
                      placeholder={
                        user.email ? user.email : "hello@youremail.com"
                      }
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="plan">
                  <Col sm={4}>Your Plan</Col>
                  <Col sm={8}>
                    <p>Beta Account</p>
                  </Col>
                </Form.Group>
              </Form>
              <Button
                variant="primary"
                disabled={isLoading}
                onClick={
                  !isLoading
                    ? handleClick
                    : () => {
                        return undefined;
                      }
                }
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </Col>
            <Col sm={4} className={"justify-content-md-center"}>
              <div className={"clipped-image-container"}>
                <img
                  className={"clipped-image"}
                  alt={"your profile"}
                  src={user.photoURL || ""}
                />
              </div>
            </Col>
          </Row>
        </Col>
      )}
    </>
  );
};

const AccountManagement = () => {
  const { authenticated, isAnonymous, user } = useAuthentication({
    ensureSignedInAnonymously: false,
  });

  useEffect(() => {
    document.title = "Arium Account";
  }, []);

  const requiresLogin = useMemo(() => !authenticated || isAnonymous, [
    authenticated,
    isAnonymous,
  ]);

  return (
    <>
      <Layout format="signUpFlow">
        {requiresLogin && <Login />}
        {!requiresLogin && user && (
          <>
            <Row className={"account-title"}>
              <h1>Your Account</h1>
            </Row>

            <Row>
              <Col sm={3}>
                <Nav defaultActiveKey="/home" className="flex-column">
                  <Nav.Link href="#profile">Your Profile</Nav.Link>
                  <Nav.Link href="#spaces">Spaces</Nav.Link>
                  <Nav.Link href="#plan">Plan</Nav.Link>
                  <Nav.Link href="#logout">Logout</Nav.Link>
                </Nav>
              </Col>
              <Col sm={9}>
                <Row id="profile" className={"account-section"}>
                  <AccountView user={user} />
                </Row>
                <hr />
                <Row id="spaces" className={"account-section"}>
                  <SpacesView user={user} />
                </Row>
                <hr />
                <Row id="plan" className={"account-section"}>
                  <PlanView user={user} />
                </Row>
                <hr />
                <Row id="logout" className={"account-section"}>
                  <LogoutButton />
                </Row>
              </Col>
            </Row>
          </>
        )}
      </Layout>
    </>
  );
};

export default AccountManagement;
