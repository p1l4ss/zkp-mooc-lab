import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";
import { Container, Row, Col } from "reactstrap";
import products from "../assets/fake-data/products";
import ProductCard from "../components/UI/product-card/ProductCard";

import "../styles/all-foods.css";
import "../styles/pagination.css";

const AllFoods = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Pizza");
  const [allProducts, setAllProducts] = useState(products);

  useEffect(() => {
    if (category === "Discount") {
      navigate('/contact')
    }

    if (category === "Pizza") {
      const filteredProducts = products.filter(
        (item) => item.category === "Pizza"
      );

      setAllProducts(filteredProducts);
    }

    if (category === "Side") {
      const filteredProducts = products.filter(
        (item) => item.category === "Side"
      );

      setAllProducts(filteredProducts);
    }

    if (category === "Desert") {
      const filteredProducts = products.filter(
        (item) => item.category === "Desert"
      );

      setAllProducts(filteredProducts);
    }

    if (category === "Drink") {
      const filteredProducts = products.filter(
        (item) => item.category === "Drink"
      );

      setAllProducts(filteredProducts);
    }
  }, [category]);

  return (
    <Helmet title="All-Foods">
      <section>
        <Container>
        <Col lg="12">
              <div className="food__category d-flex align-items-center justify-content-center gap-4">
                <button
                  className={`all__btn  ${
                    category === "Discount" ? "foodBtnActive" : ""
                  } `}
                  onClick={() => setCategory("Discount")}
                >
                  Discount
                </button>
                <button
                  className={`d-flex align-items-center gap-2 ${
                    category === "Pizza" ? "foodBtnActive" : ""
                  } `}
                  onClick={() => setCategory("Pizza")}
                >
                  
                Pizza
                </button>

                <button
                  className={`d-flex align-items-center gap-2 ${
                    category === "Side" ? "foodBtnActive" : ""
                  } `}
                  onClick={() => setCategory("Side")}
                >
                 
                  Side
                </button>

                <button
                  className={`d-flex align-items-center gap-2 ${
                    category === "Desert" ? "foodBtnActive" : ""
                  } `}
                  onClick={() => setCategory("Desert")}
                >
                 
                 Desert
                </button>

                <button
                  className={`d-flex align-items-center gap-2 ${
                    category === "Drink" ? "foodBtnActive" : ""
                  } `}
                  onClick={() => setCategory("Drink")}
                >
                 
                 Drink
                </button>
              </div>
            </Col>

          <Row>
            
            {allProducts.map((item) => (
              <Col lg="3" md="4" sm="6" xs="6" key={item.id} className="mb-4">
                <ProductCard item={item} />
              </Col>
            ))}

          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default AllFoods;