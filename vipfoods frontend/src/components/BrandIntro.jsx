import {
  useEffect,
  useRef,
  useState,
} from "react";

import logo from "../assets/logo.png";

import "./BrandIntro.css";


export default function BrandIntro({
  onComplete,
}) {

  const introRef = useRef(null);

  const flyingLogoRef = useRef(null);

  const [finished, setFinished] =
    useState(false);


  useEffect(() => {

    const intro = introRef.current;

    const flyingLogo =
      flyingLogoRef.current;


    if (!intro || !flyingLogo) {
      return;
    }


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      "hidden";


    const navbarLogo =
      document.getElementById(
        "navbar-brand-logo"
      );


    if (navbarLogo) {
      navbarLogo.style.opacity = "0";
    }


    const timers = [];


    /* IMAGE APPEARS */

    timers.push(
      setTimeout(() => {

        intro.classList.add(
          "intro-visible"
        );

      }, 100)
    );


    /* BRAND NAME APPEARS */

    timers.push(
      setTimeout(() => {

        intro.classList.add(
          "show-brand-name"
        );

      }, 1200)
    );


    /* CIRCULAR LOGO APPEARS */

    timers.push(
      setTimeout(() => {

        intro.classList.add(
          "prepare-logo-flight"
        );

      }, 2600)
    );


    /* LOGO MOVES TO NAVBAR */

    timers.push(
      setTimeout(() => {

        if (!navbarLogo) {

          intro.classList.add(
            "intro-exit"
          );

          return;
        }


        const destination =
          navbarLogo.getBoundingClientRect();


        const flyingRect =
          flyingLogo.getBoundingClientRect();


        const moveX =
          destination.left +
          destination.width / 2 -
          (
            flyingRect.left +
            flyingRect.width / 2
          );


        const moveY =
          destination.top +
          destination.height / 2 -
          (
            flyingRect.top +
            flyingRect.height / 2
          );


        const scale =
          destination.width /
          flyingRect.width;


        flyingLogo.style.setProperty(
          "--move-x",
          `${moveX}px`
        );


        flyingLogo.style.setProperty(
          "--move-y",
          `${moveY}px`
        );


        flyingLogo.style.setProperty(
          "--final-scale",
          scale
        );


        intro.classList.add(
          "logo-flying"
        );

      }, 3400)
    );


    /* REVEAL REAL NAVBAR LOGO */

    timers.push(
      setTimeout(() => {

        if (navbarLogo) {
          navbarLogo.style.opacity = "1";
        }


        intro.classList.add(
          "intro-exit"
        );

      }, 4700)
    );


    /* COMPLETELY REMOVE INTRO */

    timers.push(
      setTimeout(() => {

        document.body.style.overflow =
          previousOverflow;


        setFinished(true);


        if (onComplete) {
          onComplete();
        }

      }, 5400)
    );


    return () => {

      timers.forEach(clearTimeout);


      document.body.style.overflow =
        previousOverflow;


      if (navbarLogo) {
        navbarLogo.style.opacity = "1";
      }

    };

  }, [onComplete]);


  if (finished) {
    return null;
  }


  return (
    <div
      ref={introRef}
      className="brand-intro"
      aria-hidden="true"
    >

      <div
        className="brand-intro-background"
        style={{
          backgroundImage:
            `url(${logo})`,
        }}
      />


      <div className="brand-intro-gradient" />


      <div className="brand-intro-image-wrapper">

        <img
          src={logo}
          alt=""
          className="brand-intro-image"
        />

      </div>


      <div className="brand-intro-title-wrapper">

        <h1 className="brand-intro-title">
          VIP Foods
        </h1>

        <p className="brand-intro-tagline">
          HOMEMADE TASTE. PREMIUM QUALITY.
        </p>

      </div>


      <div
        ref={flyingLogoRef}
        className="brand-intro-flying-logo"
      >

        <img
          src={logo}
          alt=""
        />

      </div>

    </div>
  );
}