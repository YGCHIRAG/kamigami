import gsap from "gsap";
import { useRef, useEffect, useState } from "react";
import api from "../../services/api";

import Button from "./Button";
import AnimatedTitle from "./AnimatedTitle";

const DEFAULT_ABOUT_PAGE = {
  storySub: "the divine shadow world",
  storyTitle: "the bl<b>o</b>od of <br /> a sacred real<b>m</b>",
  storyImage: "/img/entrance.webp",
  storyText: "Where shadows converge, rises KAMIGAMI and the eternal gateway. Uncover its secrets and forge your identity within infinite darkness.",
  storyBtnText: "UNLOCK THE ORIGIN"
};

const FloatingImage = () => {
  const frameRef = useRef(null);
  const [aboutPageData, setAboutPageData] = useState(DEFAULT_ABOUT_PAGE);

  useEffect(() => {
    const fetchAboutCms = async () => {
      try {
        const res = await api.get('/settings/about_page_cms');
        if (res.data?.data?.value) {
          setAboutPageData(res.data.data.value);
        }
      } catch (err) {
        console.log('[CMS-AboutPage-Story] Fetch failed or settings unseeded, using default parameters.');
      }
    };
    fetchAboutCms();
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const element = frameRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((yPos - centerY) / centerY) * -10;
    const rotateY = ((xPos - centerX) / centerX) * 10;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPerspective: 500,
      ease: "power1.inOut",
    });
  };

  const handleMouseLeave = () => {
    const element = frameRef.current;

    if (element) {
      gsap.to(element, {
        duration: 0.3,
        rotateX: 0,
        rotateY: 0,
        ease: "power1.inOut",
      });
    }
  };

  return (
    <div id="story" className="min-h-dvh w-full bg-black text-[#E71E22] overflow-hidden">
      <div className="flex size-full flex-col items-center py-10 pb-24">
        <p className="font-general text-sm uppercase md:text-[10px]">
          {aboutPageData.storySub || "the divine shadow world"}
        </p>
 
         <div className="relative size-full">
          <AnimatedTitle
            key={aboutPageData.storyTitle || "default"}
            title={aboutPageData.storyTitle || "the bl<b>o</b>od of <br /> a sacred real<b>m</b>"}
            containerClass="mt-5 pointer-events-none mix-blend-difference relative z-10"
          />
 
           <div className="story-img-container">
             <div className="story-img-mask">
               <div className="story-img-content">
                 <img
                   ref={frameRef}
                   onMouseMove={handleMouseMove}
                   onMouseLeave={handleMouseLeave}
                   onMouseUp={handleMouseLeave}
                   onMouseEnter={handleMouseLeave}
                   src={aboutPageData.storyImage || "/img/entrance.webp"}
                   alt="entrance"
                   className="object-contain"
                 />
              </div>
            </div>

            {/* for the rounded corner */}
            <svg
              className="invisible absolute size-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="flt_tag">
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="8"
                    result="blur"
                  />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                    result="flt_tag"
                  />
                  <feComposite
                    in="SourceGraphic"
                    in2="flt_tag"
                    operator="atop"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        <div className="-mt-80 flex w-full justify-center md:-mt-64 md:me-44 md:justify-end">
          <div className="flex h-full w-fit flex-col items-center md:items-start">
            <p 
              className="mt-3 max-w-sm text-center font-circular-web text-[#dfdff2] md:text-start"
              dangerouslySetInnerHTML={{ 
                __html: (aboutPageData.storyText || "Where shadows converge, rises KAMIGAMI and the eternal gateway. Uncover its secrets and forge your identity within infinite darkness.")
                  .replace(/\n/g, '<br />')
              }}
            />

            <Button
              id="realm-btn"
              title={aboutPageData.storyBtnText || "UNLOCK THE ORIGIN"}
              containerClass="mt-5"
              to="/all-products"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingImage;