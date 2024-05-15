import React, { useState, useEffect } from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";
import { Container, Row, Col } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";
import "../styles/register.css";

const Register = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch CSRF token from the server
    axios.get('http://localhost:5001/csrf-token', { withCredentials: true })
      .then(response => {
        setCsrfToken(response.data.csrfToken);
      })
      .catch(error => {
        console.error('Error fetching CSRF token', error);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    if (!captchaToken) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5001/register', {
        username: user,
        password: pwd,
        captchaToken: captchaToken,
      }, {
        headers: {
          'CSRF-Token': csrfToken
        },
        withCredentials: true,
      });

      if (res.data.Status === "Success") {
        setLoading(false);
        navigate('/login');
      } else {
        setLoading(false);
        setError(true);
      }
    } catch (err) {
      setLoading(false);
      setError(true);
    }
  };

  const onCaptchaChange = (value) => {
    setCaptchaToken(value);
  };

  return (
    <Helmet title="Signup">
      <CommonSection title="Signup" />
      <section>
        <Container>
          <Row>
            <Col lg="6" md="6" sm="12" className="m-auto text-center">
              <form className="form mb-5" onSubmit={handleSubmit}>
                <div className="form__group">
                  <label htmlFor="username">Username:</label>
                  <input
                    type="text"
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="Enter username"
                    name="username"
                    required
                  />
                </div>
                <div className="form__group">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Enter password"
                    name="password"
                    required
                  />
                </div>
                <div className="form__group">
                  <ReCAPTCHA
                    sitekey="your-site-key" // Replace with your site key
                    onChange={onCaptchaChange}
                  />
                </div>
                <button disabled={loading}>{loading ? 'Loading...' : 'Sign Up'}</button>
              </form>
              <Link to="/login">Already have an account? Login</Link>
              <p className='text-red-700 mt-5'>{error && 'Something went wrong!'}</p>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Register;
