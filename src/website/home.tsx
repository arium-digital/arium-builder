import Layout from "./layout";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

const Home = () => {
  return (
    <Layout>
      <Col className="nopadding">
        <Row>
          <Col>
            <Row className="justify-content-center">
              <img alt="get together in 3d text" src="/images/hero-image.png" />
            </Row>
          </Col>
          <Container className="bg-image vh-100 d-flex flex-column" fluid>
            <div className="d-flex h-75">
              <div className="col-lg-6 align-self-center justify-content-center text-md-left ml-lg-5">
                <h1 className="font-weight-bold mb-4 font-size-big pt-5">
                  Its just like being in the same room together again
                </h1>

                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-main"
                    data-toggle="modal"
                    data-target="#exampleModal"
                  >
                    Find your space
                  </button>
                </div>
              </div>
            </div>

            <div className="d-flex h-25">
              <div className="col-lg-12 skewed-text align-self-center text-center text-md-left mb-5">
                <div className=" col-lg-6 ml-auto">
                  <h2>
                    a 3D video chat platform? <br /> Show me how it works
                  </h2>
                </div>
              </div>
            </div>
          </Container>
        </Row>

        <Row>
          <Container>
            <Row>
              <Col>
                <div className="heading nopadding">
                  <h3>Join our hosts &amp; guests!</h3>
                </div>
                <Row>
                  <Col>
                    <div className="block">
                      <div className="gallery-overlay"></div>
                      <img
                        className="img-fluid img-max"
                        src="/images/logos/mit-media-lab-logo.png"
                        alt="MIT Media Lab"
                      />
                    </div>
                  </Col>
                  <Col>
                    <div className="block">
                      <div className="gallery-overlay"></div>
                      <img
                        className="img-fluid img-max"
                        src="/images/logos/adopt-a-pet-logo.png"
                        alt="Adopt a Pet"
                      />
                    </div>
                  </Col>
                  <Col>
                    <div className="block">
                      <div className="gallery-overlay"></div>
                      <img
                        className="img-fluid img-max"
                        src="/images/logos/pbfa-logo.png"
                        alt="PBFA"
                      />
                    </div>
                  </Col>
                  <Col>
                    <div className="block">
                      <div className="gallery-overlay"></div>
                      <img
                        className="img-fluid img-max"
                        src="/images/logos/ars-electronica-logo.png"
                        alt="ars electronica"
                      />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </Row>

        <Row>
          <Container fluid="md">
            <Col>
              <video muted loop autoPlay width="100%">
                <source src="/images/arium.webm" type="video/webm" />
                <source src="/images/arium.mp4" type="video/mp4" />
              </video>
            </Col>
          </Container>
        </Row>

        <Row>
          <div className="col-md-12 text-center">
            <h1 className="why-arium-heading dark-text font-weight-bold">
              Why Arium?
            </h1>
          </div>
        </Row>

        <Row id="slanted-up" className="bg-orange section">
          <div className="col-md-6 text-center mb-5 mb-lg-0 ">
            <img className="img-fluid" src="/images/3d.png" alt="" />
          </div>
          <div className="col-md-4 align-self-center text-center text-md-left">
            <div className="content">
              <h2 className="subheading text-center dark-text font-weight-bold mb-10">
                Share a 3D space
              </h2>
              <p className="dark-text text-center">
                As if you were in the same room together
              </p>
            </div>
          </div>
        </Row>

        <Row>
          <div className="col-md-6 align-self-center text-center text-md-left">
            <div className="content">
              <h2 className="subheading  text-center dark-text font-weight-bold mb-10">
                Everyone can talk, <br /> at the same time
              </h2>
              <p className="dark-text text-center">
                Flow naturally between conversations
              </p>
            </div>
          </div>
          <div className="col-md-6 text-center mb-5 mb-lg-0">
            <img className="img-fluid" src="/images/gather.png" alt="" />
          </div>
        </Row>

        <Row id="slanted-down" className="bg-orange section">
          <div className="col-md-6 text-center mb-5 mb-lg-0 ">
            <img className="img-fluid" src="/images/make-it-yours.png" alt="" />
          </div>
          <div className="col-md-6 align-self-center text-center text-md-left dark-text">
            <div className="content">
              <h2 className="subheading dark-text text-center font-weight-bold mb-10">
                Make it your own
              </h2>
              <p className="dark-text text-center">
                Create the space you&rsquo;ve always dreamed of!
              </p>
            </div>
          </div>
        </Row>

        <Row className="vh-100 call-to-action bg-opacity">
          <div className="col-lg-6 col-md-8 text-center mx-auto mt-5 align-self-center ">
            <h2 className="subheading text-white">Sign Up to Learn More</h2>
            <p className="text-white">
              Enter your email to find out more about how you can host your next
              event on Arium
            </p>
            <button
              type="button"
              className="btn btn-main"
              data-toggle="modal"
              data-target="#exampleModal"
            >
              Find your space
            </button>
          </div>
        </Row>
      </Col>
    </Layout>
  );
};

export default Home;
