import { useState, useRef, useEffect } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { Link } from "react-router-dom";
import api from "../../services/api";

export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;

    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({ src, title, description, isComingSoon }) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverOpacity, setHoverOpacity] = useState(0);
  const hoverButtonRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!hoverButtonRef.current) return;
    const rect = hoverButtonRef.current.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setHoverOpacity(1);
  const handleMouseLeave = () => setHoverOpacity(0);

  const isVideo = typeof src === 'string' && (src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.ogg'));

  return (
    <div className="relative size-full">
      {isVideo ? (
        <video
          src={src}
          loop
          muted
          autoPlay
          className="absolute left-0 top-0 size-full object-cover object-center"
        />
      ) : (
        <img
          src={src}
          alt="Bento card media"
          className="absolute left-0 top-0 size-full object-cover object-center"
        />
      )}
      <div className="relative z-10 flex size-full flex-col justify-between p-5 ">
        <div>
          <h1 className="bento-title special-font text-[#E71E22]">{title}</h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base text-[#F1D6D7]">{description}</p>
          )}
        </div>

        {isComingSoon && (
          <Link
            ref={hoverButtonRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            to="/drops"
            className="border-hsla relative flex w-fit cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-black px-5 py-2 text-xs uppercase text-[#E71E22] hover:text-[#F1D6D7] z-20"
          >
            {/* Radial gradient hover effect */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
              style={{
                opacity: hoverOpacity,
                background: `radial-gradient(100px circle at ${cursorPosition.x}px ${cursorPosition.y}px, #E71E2288, #00000026)`,
              }}
            />
            <TiLocationArrow className="relative z-20" />
            <p className="relative z-20">awakening today</p>
          </Link>
        )}
      </div>
    </div>
  );
};

const Features = () => {
  const [aboutPageData, setAboutPageData] = useState({});

  useEffect(() => {
    const fetchAboutCms = async () => {
      try {
        const res = await api.get('/settings/about_page_cms');
        if (res.data?.data?.value) {
          setAboutPageData(res.data.data.value);
        }
      } catch (err) {
        console.log('[CMS-Features] Fetch failed or settings unseeded, using default parameters.');
      }
    };
    fetchAboutCms();
  }, []);

  return (
    <section className="bg-black pb-52">
      <div className="container mx-auto px-3 md:px-10">
        <div className="px-5 py-32">
          <p className="font-circular-web text-lg text-[#E71E22]">
            Into the Bloodbound Realm
          </p>
          <p className="max-w-md font-circular-web text-lg text-[#F1D6D7] opacity-50">
            Immerse yourself in a cursed and ever-expanding universe where sacred
            symbols and dark creations unite into an interconnected legacy etched
            into your soul.
          </p>
        </div>

        <BentoTilt className="bento-tilt_1 relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
          <BentoCard
            src={aboutPageData.featureVideo1 || "img/blooded.jpg"}
            title={
              <>
                blood<b>e</b>d
              </>
            }
            description="The gods do not descend. They awaken."
            isComingSoon
          />
        </BentoTilt>

        <div className="grid h-[135vh] w-full grid-cols-2 grid-rows-3 gap-7">
          <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
            <BentoCard
              src={aboutPageData.featureVideo2 || "img/blood.jpg"}
              title={
                <>
    bloo<b>d</b>
  </>
              }
              description="Those who master themselves rise beyond themselves"
              isComingSoon
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0">
            <BentoCard
              src={aboutPageData.featureVideo3 || "img/realm.jpg"}
              title={
                <>
    r<b>e</b>alm
  </>
              }
              description="A force greater than power. A bond beyond existence"
              isComingSoon
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
            <BentoCard
              src={aboutPageData.featureVideo4 || "img/armr.jpg"}
              title={
                <>
    ar<b>m</b>r
  </>
              }
              description="Every god faces a battle. Every soul chooses a side"
              isComingSoon
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <div className="flex size-full flex-col justify-between bg-[#111111] p-5">
              <h1 className="bento-title special-font max-w-56 text-[#E71E22] ">
                M<b>o</b>re co<b>m</b>ing s<b>o</b>on.
              </h1>

              <TiLocationArrow className="m-5 scale-[5] self-end text-[#E71E22]" />
            </div>
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <img
              src={aboutPageData.featureVideo5 || "img/logo.png"}
              className="size-full object-contain object-center"
            />
          </BentoTilt>
        </div>
      </div>
    </section>
  );
};

export default Features;
