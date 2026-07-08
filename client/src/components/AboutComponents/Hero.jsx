import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";
import api from "../../services/api";

import Button from "./Button";
import VideoPreview from "./VideoPreview";

const DEFAULT_ABOUT_PAGE = {
  heroTitle: "reawak<b>e</b>n",
  heroText: "Enter the Realm of Shadows <br /> Unleash Your Dark Identity",
  heroBtnText: "EXPLORE COLLECTION",
  heroVideoCount: 1
};

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  const [aboutPageData, setAboutPageData] = useState(DEFAULT_ABOUT_PAGE);
  const totalVideos = aboutPageData.heroVideoCount || 4;
  const nextVdRef = useRef(null);

  const handleVideoLoad = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchAboutCms = async () => {
      try {
        const res = await api.get('/settings/about_page_cms');
        if (res.data?.data?.value) {
          setAboutPageData(res.data.data.value);
        }
      } catch (err) {
        console.log('[CMS-AboutPage] Fetch failed or settings unseeded, using default parameters.');
      }
    };
    fetchAboutCms();
  }, []);

  useEffect(() => {
    if (loadedVideos >= 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  const handleMiniVdClick = () => {
    setHasClicked(true);

    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVdRef.current.play(),
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    {
      dependencies: [currentIndex],
      revertOnUpdate: true,
    }
  );

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (index) => {
    const customUrl = aboutPageData[`heroVideo${index}`];
    if (customUrl) return customUrl;
    if (aboutPageData.heroVideoCount === 1 || index === 1) {
      return 'videos/about_compressed.mp4';
    }
    return `videos/hero-${index}.mp4`;
  };

  return (
    <div className="relative h-dvh w-full overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-full overflow-hidden bg-black">
          
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-full overflow-hidden rounded-lg bg-blue-75"
      >
        <div>
          {totalVideos > 1 && (
            <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
              <VideoPreview>
                <div
                  onClick={handleMiniVdClick}
                  className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
                >
                  <video
                    src={getVideoSrc((currentIndex % totalVideos) + 1)}
                    loop
                    muted
                    id="current-video"
                    className="size-64 origin-center scale-150 object-cover object-center"
                    onLoadedData={handleVideoLoad}
                  />
                </div>
              </VideoPreview>
            </div>
          )}

          {totalVideos > 1 && (
            <video
              ref={nextVdRef}
              src={getVideoSrc(currentIndex)}
              loop
              muted
              id="next-video"
              className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
              onLoadedData={handleVideoLoad}
            />
          )}
          <video
            src={getVideoSrc(
              totalVideos === 1 ? 1 : (currentIndex === totalVideos - 1 ? 1 : currentIndex)
            )}
            autoPlay
            loop
            muted
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoad}
          />
        </div>

        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-[#F1D6D7]">
          K<b>A</b>MIGAMI
        </h1>

        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            <h1 
              className="special-font hero-heading text-[#F1D6D7]"
              dangerouslySetInnerHTML={{ __html: aboutPageData.heroTitle || "reawak<b>e</b>n" }}
            />

            <p 
              className="mb-5 max-w-64 font-robert-regular text-[#F1D6D7]"
              dangerouslySetInnerHTML={{ 
                __html: (aboutPageData.heroText || "Enter the Realm of Shadows <br /> Unleash Your Dark Identity")
                  .replace(/\n/g, '<br />')
              }}
            />

            <Button
              id="watch-trailer"
              title={aboutPageData.heroBtnText || "EXPLORE COLLECTION"}
              leftIcon={<TiLocationArrow />}
              containerClass="bg-[#F1D6D7] flex-center gap-1"
              to="/collections"
            />
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-[#E71E22]">
        K<b>A</b>MIGAMI
      </h1>
    </div>
  );
};

export default Hero;