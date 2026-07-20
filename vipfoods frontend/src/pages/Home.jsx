import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import picklesCard from "../assets/pickles.png";
import snacksCard from "../assets/homefoods.png";
import freshCard from "../assets/vegetable.png";
import spicesCard from "../assets/spices.png";
import dairyCard from "../assets/dairy.png";
import bussiness1 from "../assets/bussiness1.jpg";
import bussiness2 from "../assets/bussiness2.jpg";
import bussiness3 from "../assets/bussiness3.jpg";
import bussiness4 from "../assets/bussiness4.jpg";
import bussiness5 from "../assets/bussiness5.jpg";
import "./home.css";
import { getHomeBanner } from "../services/homeBannerService";

const categories = [
  {
    id: "pickles",
    title: "VIP Pickles",
    eyebrow: "Sun-cured jars",
    desc: "Mango, gongura, lemon and seasonal pickles made in small home-style batches.",
    emoji: "🫙",
    className: "pickle-card",
    image: picklesCard,
  },
  {
    id: "snacks",
    title: "Home Snacks",
    eyebrow: "Fresh crunch",
    desc: "Roasted mixtures, traditional bites and tea-time snacks packed fresh.",
    emoji: "🥨",
    className: "snack-card",
    image: snacksCard,
  },
  {
    id: "fresh",
    title: "VIP Fresh",
    eyebrow: "Vegetables",
    desc: "Leafy greens and daily vegetables are sourced from trusted local farms.",
    emoji: "🥬",
    className: "fresh-card",
    image: freshCard,
  },
  {
    id: "spices",
    title: "VIP Spices",
    eyebrow: "Pure powders",
    desc: "Turmeric, chilli powder and masalas stone-ground for bold aroma.",
    emoji: "🌶️",
    className: "spice-card",
    image: spicesCard,
  },
  {
    id: "dairy",
    title: "VIP Dairy",
    eyebrow: "Creamy dairy",
    desc: "Curd, milk, ghee and paneer made with farm-fresh milk for every kitchen.",
    emoji: "🥛",
    className: "dairy-card",
    image: dairyCard,
  },
];

const highlights = [
  "No preservatives",
  "Small-batch cooking",
  "Farm direct vegetables",
  "Freshly ground spices",
];

const whyCards = [
  {
    title: "Why VIP Foods",
    emoji: "🌞",
    desc: "We make everyday food feel like a sun-warmed pantry: fresh jars, honest ingredients and flavors that belong in an Indian home kitchen.",
  },
  {
    title: "What speciality",
    emoji: "💎",
    desc: "Pickles are sun-cured, spices are ground in small batches, snacks are packed fresh and vegetables are sourced close to home.",
  },
];

const testimonials = [
  {
    name: "Anusha R.",
    place: "Hyderabad",
    text: "The mango pickle tastes exactly like my grandmother's jar. Spicy, oily in the right way and full of aroma.",
  },
  {
    name: "Kiran M.",
    place: "Vijayawada",
    text: "VIP Fresh vegetables arrived clean and crisp. The greens were still bright when I opened the box.",
  },
  {
    name: "Meghana S.",
    place: "Bengaluru",
    text: "Their turmeric and chilli powder changed the color and smell of my cooking. It feels genuinely homemade.",
  },
  {
    name: "Rahul P.",
    place: "Chennai",
    text: "Snacks were fresh, not oily. The glass-style site also makes ordering feel premium and simple.",
  },
];

function TiltCard({ children, className = "" }) {
  const cardRef = useRef(null);

  const handleMouseMove = (event) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -14;
    const rotateY = ((x - rect.width / 2) / rect.width) * 14;

    card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  return (
    <article
      ref={cardRef}
      className={`tilt-card-inner ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </article>
  );
}

export default function Home() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadBanner = async () => {
      try {
        const response = await getHomeBanner();
        if (isMounted) {
          setBanner(response?.banner ?? null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="home-page">
      <div className="page-accent accent-red-a"></div>
      <div className="page-accent accent-yellow"></div>
      <div className="page-accent accent-lime"></div>
      <div className="page-accent accent-orange"></div>
      <div className="page-accent accent-red-b"></div>

      <section id="home" className="vip-hero">
        <div className="hero-noise"></div>
        <div className="floating-orbit orbit-a float-3d">🫙</div>
        <div className="floating-orbit orbit-b float-3d">🌿</div>
        <div className="floating-orbit orbit-c float-3d">🌶️</div>
        <div className="floating-orbit orbit-d float-3d">🍏</div>

        <div className="hero-shell">
          <div className="hero-copy">
            <p className="hero-kicker">Organic pickles, snacks, fresh vegetables and spices</p>
            <h1>
              VIP Foods
              <span>Homemade taste. Premium everyday groceries.</span>
            </h1>
            <p className="hero-description">
              Shop sun-cured pickles, fresh home snacks, farm vegetables and
              pure turmeric and chilli powders from one beautiful organic store.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="cta-btn hero-cta" title="Shop Now">
                Shop Now
              </Link>

              <Link to="/register" className="ghost-cta" title="Create Account">
                Create Account
              </Link>
            </div>

            <div className="hero-pills">
              {highlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="VIP Foods featured images">
            <div className="jar-stage">
              <div className="jar-glow"></div>

              {/* Slideshow Circle */}
              <div className="slideshow-circle">
                <img src={bussiness1} className="slide" alt="Bussiness 1" />
                <img src={bussiness2} className="slide" alt="Bussiness 2" />
                <img src={bussiness3} className="slide" alt="Bussiness 3" />
                <img src={bussiness4} className="slide" alt="Bussiness 4" />
                <img src={bussiness5} className="slide" alt="Bussiness 5" />
              </div>

              {/* Orbit cards still float around */}
              <div className="mini-card mini-card-top glass-card">
                <span>🌶️</span>
                Fresh chilli aroma
              </div>
              <div className="mini-card mini-card-bottom glass-card">
                <span>🥬</span>
                Farm direct greens
              </div>
            </div>
          </div>
        </div>
      </section>

      {banner && (
        <section className="home-offer-banner">
          <div className="home-offer-left">
            {banner?.discountText && (
              <span className="offer-tag">{banner.discountText}</span>
            )}

            <h2>{banner?.title}</h2>

            {banner?.subtitle && <p>{banner.subtitle}</p>}

            {banner?.couponCode && (
              <div className="coupon-box">
                <span>Use Code</span>
                <strong>{banner.couponCode}</strong>
              </div>
            )}

            {Number(banner?.minimumOrder) > 0 && (
              <p className="minimum-order">Minimum Order ₹{banner.minimumOrder}</p>
            )}

            <Link to={banner?.buttonLink || "/products"} className="offer-btn">
              {banner?.buttonText || "Shop Now"}
            </Link>
          </div>

          <div className="home-offer-right">
            {banner?.image && (
  <img
    src={banner.image}
    alt={banner.title || "Offer banner"}
  />
)}
          </div>
        </section>
      )}

      <section id="categories" className="section-wrap">
        <div className="section-heading">
          <p>Shop by range</p>
          <h2>Colors that feel like pickles, farms and spice tins.</h2>
        </div>

        <div className="category-carousel">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            loop
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            navigation
            breakpoints={{
              0: { slidesPerView: 1 },
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1320: { slidesPerView: 4 },
            }}
          >
            {categories.map((category) => (
              <SwiperSlide key={category.id}>
                <TiltCard className={`glass-card category-card ${category.className}`}>
                  <img src={category.image} alt={category.title} className="category-art" />
                  <span className="category-eyebrow">{category.eyebrow}</span>
                  <div className="category-emoji">{category.emoji}</div>
                  <h3>{category.title}</h3>
                  <p>{category.desc}</p>
                  <Link
                    to={`/products?category=${category.id}`}
                    className="category-link"
                    onClick={() =>
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      })
                    }
                  >
                    Explore
                  </Link>
                </TiltCard>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section id="about" className="section-wrap why-section">
        <div className="section-heading">
          <p>Our kitchen promise</p>
          <h2>Why VIP Foods feels different from ordinary grocery stores.</h2>
        </div>

        <div className="why-grid">
          {whyCards.map((card) => (
            <TiltCard key={card.title} className="glass-card why-card">
              <div className="why-icon">{card.emoji}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="section-wrap testimonial-section">
        <div className="section-heading">
          <p>Customer love</p>
          <h2>What our customers says.</h2>
        </div>

        <div className="testimonial-carousel" aria-label="Customer testimonials">
          <div className="testimonial-track">
            {[...testimonials, ...testimonials].map((item, index) => (
              <article className="glass-card testimonial-card" key={`${item.name}-${index}`}>
                <div className="testimonial-stars">★★★★★</div>
                <p>"{item.text}"</p>
                <h3>{item.name}</h3>
                <span>{item.place}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vip-auth-banner">
        <div>
          <p>VIP Member Access</p>
          <h2>Login or register for saved carts, faster checkout and fresh-drop alerts.</h2>
        </div>
        <div className="auth-banner-actions">
          <Link to="/login" className="ghost-cta dark" title="Login">
            Login
          </Link>

          <Link to="/register" className="cta-btn" title="Register">
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}