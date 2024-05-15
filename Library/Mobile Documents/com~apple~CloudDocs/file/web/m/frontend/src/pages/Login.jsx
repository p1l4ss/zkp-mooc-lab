import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";
import { Container, Row, Col } from "reactstrap";
import OAuth from '../components/OAuth';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../store/user/userSlice';
import "../styles/login.css";

const Login = () => {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const [loginStatus, setLoginStatus] = useState('');
  const [statusHolder, setStatusHolder] = useState('message');

  useEffect(() => {
    // Fetch CSRF token when the component mounts
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('http://localhost:5001/csrf-token');
        setCsrfToken(response.data.csrfToken);
      } catch (err) {
        console.error('Error fetching CSRF token', err);
      }
    };

    fetchCsrfToken();
  }, []);

  axios.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      setLoginStatus('Please complete the CAPTCHA');
      return;
    }

    dispatch(signInStart());
    try {
      const res = await axios.post('http://localhost:5001/login', {
        username: user,
        password: pwd,
        captchaToken: captchaToken,
        csrfToken: csrfToken,
      });

      if (res.data.Status === 'Success') {
        dispatch(signInSuccess(res.data));
        setLoginStatus('Login successful!');
        navigateTo('/');
      } else {
        dispatch(signInFailure());
        setLoginStatus('Login failed!');
      }
    } catch (err) {
      dispatch(signInFailure());
      setLoginStatus('Login failed!');
      console.error(err);
    }
  }

  useEffect(() => {
    if (loginStatus !== '') {
      setStatusHolder('showMessage');
      const timer = setTimeout(() => {
        setStatusHolder('message');
        setLoginStatus('');
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [loginStatus]);

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  return (
    <Helmet title="Login">
      <CommonSection title="Login" />
      <section>
        <Container>
          <Row>
            <Col lg="6" md="6" sm="12" className="m-auto text-center">
              <section>
                <form className="form mb-5" onSubmit={handleSubmit}>
                  <span className={statusHolder}>{loginStatus}</span>
                  <div className="form__group">
                    <label htmlFor="username">Username:</label>
                    <input
                      type="text"
                      placeholder="username"
                      onChange={(e) => setUser(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form__group">
                    <label htmlFor="password">Password:</label>
                    <input
                      type="password"
                      id="password"
                      placeholder="password"
                      onChange={(e) => setPwd(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form__group">
                    <ReCAPTCHA
                      sitekey="YOUR_RECAPTCHA_SITE_KEY"
                      onChange={onCaptchaChange}
                    />
                  </div>

                  <OAuth />
                  <br />
                  <button type="submit" className="addTOCart__btn" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              </section>

              <Link to="/register">CAN'T SIGN IN? CREATE ACCOUNT</Link>
              <p className="text-red-700 mt-5">
                {error ? error.message || 'Something went wrong!' : ''}
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Login;
