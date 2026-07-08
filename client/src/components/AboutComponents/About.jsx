import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-[#E71E22] text-sm uppercase md:text-[10px]">
          Welcome to KAMIGAMI
        </p>

        <AnimatedTitle
          title="Forg<b>e</b> the shadows <br /> darkest sacred <b>b</b>loodline"
          containerClass="mt-5 !text-[#F1D6D7] text-center"
        />

        <div className="about-subtext">
          <p>The Bloodline Awakens—your path, now a sacred legend</p>
          <p className="text-gray-500">
            KAMIGAMI brings together followers of shadow and power from distant
            realms and modern streets into one eternal Gothic Order
          </p>
        </div>
      </div>

      <div className="h-dvh w-full" id="clip">
        <div className="mask-clip-path about-image">
          <img
            src="img/about.jpg"
            alt="Background"
            className="absolute left-0 top-0 size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
