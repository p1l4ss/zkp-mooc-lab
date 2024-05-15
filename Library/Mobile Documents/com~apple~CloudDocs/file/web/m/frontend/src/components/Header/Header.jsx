import React, { useRef, useEffect, useState } from "react";
import axios from 'axios';
import { Container } from "reactstrap";
import logo from "../../assets/images/res-logo.png";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { cartUiActions } from "../../store/shopping-cart/cartUiSlice";
import "../../styles/header.css";
import { signOut } from "firebase/auth";

const nav__links = [
  {
    display: "Home",
    path: "/",
  },
  {
    display: "Menu",
    path: "/menu",
  },
  {
    display: "Cart", 
    path: "/cart",
  },
  {
    display: "Discount",
    path: "/contact",
  },
];

const Header = () => {
  const menuRef = useRef();
  const headerRef = useRef();
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const toggleMenu = () => {
    if (menuRef.current) {
      menuRef.current.classList.toggle("show__menu");
    }
  }

  const toggleCart = () => {
    dispatch(cartUiActions.toggle());
  };

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
          headerRef.current.classList.add("header__shrink");
        } else {
          headerRef.current.classList.remove("header__shrink");
        }
      }
    };
  
    window.addEventListener("scroll", handleScroll);
  
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [auth, setAuth] = useState(false)
  const [message, setMessage] = useState('')
  const [username, setUserName] =useState('')
  
  axios.defaults.withCredentials = true;
  console.log(auth)
  useEffect(()=>{
    axios.get('http://localhost:5001')
        .then(res => {
          console.log(res.data)
            if (res.data.Status === "Success") {
              setAuth(true)  
              setUserName(res.data.username.username)
            } else {
              setAuth(false)
              setMessage(res.data.Error)
            }
        })
  },[])

  const handleSignout = (e) => {
    axios.get('http://localhost:5001/logout')
    .then((res)=>{
      console.log(res)
      if(res.data.Status === 'Success'){
        navigateTo('/login')
        setAuth(false)
        //dispatch(signOut())
      }})
  }

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <div className="nav__wrapper d-flex align-items-center justify-content-between">
          
          <div className="logo">
            <img src={logo} alt="logo" />
            <h5>Tasty Treat</h5>
          </div>

          {/* ======= menu ======= */}
          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <div className="menu d-flex align-items-center gap-5">
              {nav__links.map((item, index) => (
                <NavLink
                  to={item.path}
                  key={index}
                  className={(navClass) =>
                    navClass.isActive ? "active__menu" : ""
                  }
                >
                  {item.display}
                </NavLink>
              ))}
            </div>
          </div>

          {/* ======== nav right icons ========= */}
          <div className="nav__right d-flex align-items-center gap-4">
            <span className="cart__icon" onClick={toggleCart}>
              <i class="ri-shopping-basket-line"></i>
              <span className="cart__badge">{totalQuantity}</span>
            </span>
              
            {auth ?
            <span className="user">
             
                <i class="ri-user-line"></i>
                <p>{username}</p>
                <button onClick={handleSignout} >Sign out </button>
              
            </span>
            :
            <span className="user">
              <Link to="/login">
                <i class="ri-user-line"></i>  
                  
              </Link>
            </span>
            }

            <span className="mobile__menu" onClick={toggleMenu}>
              <i class="ri-menu-line"></i>
            </span>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;