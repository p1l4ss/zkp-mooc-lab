import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import Helmet from '../components/Helmet/Helmet';
import CommonSection from '../components/UI/common-section/CommonSection';
import "../styles/checkout.css";
import { AiFillCheckCircle } from "react-icons/ai";

const Checkout = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const [csrfToken, setCsrfToken] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/csrf-token')
      .then(response => {
        setCsrfToken(response.data.csrfToken);
      })
      .catch(error => {
        console.error('Error fetching CSRF token:', error);
      });
  }, []);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!captchaToken) {
      alert('Please complete the CAPTCHA');
      return;
    }
    setLoading(true);
    axios.post('http://localhost:5001/checkout', {
      cartItems,
      totalAmount,
      _csrf: csrfToken,
      captchaToken
    })
      .then(response => {
        if (response.data.status === 'Success') {
          setOrderSuccess(true);
        } else {
          setError(true);
        }
      })
      .catch(error => {
        console.error('Error during checkout:', error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (orderSuccess) {
    return (
      <div className="checkoutMessage">
        <div className="checkoutTitleContainer">
          <AiFillCheckCircle className="checkoutIcon" />
          <h3>Thank you for your order!</h3>
        </div>
        <span>
          Your order is being processed and will be served as fast as possible.
        </span>
      </div>
    );
  }

  return (
    <Helmet title="Checkout">
      <CommonSection title="Checkout" />
      <section>
        <Container>
          <Row>
            <Col lg="12">
              <h5 className="mb-5">Summary of your order</h5>
              <table className="table table-borderless mb-5 align-middle">
                <tbody>
                  {cartItems.map((item) => (
                    <Tr item={item} key={item.id} />
                  ))}
                </tbody>
              </table>
              <div className="mt-4">
                <h6>
                  Total: 
                  <span className="cart__subtotal">{totalAmount}</span>$
                </h6>
                <p>Taxes already included</p>
                <form onSubmit={handleCheckout}>
                  <ReCAPTCHA
                    sitekey="YOUR_RECAPTCHA_SITE_KEY"
                    onChange={token => setCaptchaToken(token)}
                  />
                  <button className="addTOCart__btn mt-4" type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </form>
                {error && <p className='text-red-700 mt-5'>Something went wrong!</p>}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

const Tr = ({ item }) => {
  const { id, image01, title, price, quantity } = item;
  return (
    <tr>
      <td className="text-center cart__img-box">
        <img src={image01} alt="" />
      </td>
      <td className="text-center">{title}</td>
      <td className="text-center">${price}</td>
      <td className="text-center">{quantity}px</td>
    </tr>
  );
};

export default Checkout;
