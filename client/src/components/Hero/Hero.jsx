import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../Hero/hero.css";
import gsap from "gsap";
import Draggable from "gsap/dist/Draggable";
import videoSrc from "../../assets/videos/LandingPage_compressed.mp4";
import api from "../../services/api";

gsap.registerPlugin(Draggable);

const boxes = [
  {
    width: "calc(0.6 * (100vw - 40px) - 2.5px)",
    height: "calc(0.55 * (100vh - 88px) - 2.5px)",
    left: "20px",
    top: "68px"
  },
  {
    width: "calc(0.2 * (100vw - 40px) - 2.5px)",
    height: "calc(0.65 * (100vh - 88px) - 2.5px)",
    left: "calc(20px + 0.6 * (100vw - 40px) + 2.5px)",
    top: "68px"
  },
  {
    width: "calc(0.2 * (100vw - 40px) - 2.5px)",
    height: "calc(0.65 * (100vh - 88px) - 2.5px)",
    left: "calc(20px + 0.8 * (100vw - 40px) + 2.5px)",
    top: "68px"
  },
  {
    width: "calc(0.45 * (100vw - 40px) - 2.5px)",
    height: "calc(0.45 * (100vh - 88px) - 2.5px)",
    left: "20px",
    top: "calc(68px + 0.55 * (100vh - 88px) + 2.5px)"
  },
  {
    width: "calc(0.15 * (100vw - 40px) - 2.5px)",
    height: "calc(0.45 * (100vh - 88px) - 2.5px)",
    left: "calc(20px + 0.45 * (100vw - 40px) + 2.5px)",
    top: "calc(68px + 0.55 * (100vh - 88px) + 2.5px)"
  },
  {
    width: "calc(0.4 * (100vw - 40px) - 2.5px)",
    height: "calc(0.35 * (100vh - 88px) - 2.5px)",
    left: "calc(20px + 0.6 * (100vw - 40px) + 2.5px)",
    top: "calc(68px + 0.65 * (100vh - 88px) + 2.5px)"
  }
];

export default function MaskVideo() {
  const videoRef = useRef(null);
  const maskRefs = useRef([]);
  const heroRef = useRef(null);
  const [featuredDrop, setFeaturedDrop] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Fetch drops and active status on load
  useEffect(() => {
    const fetchDrops = async () => {
      try {
        const res = await api.get('/drops');
        const drops = res.data?.data?.drops || [];
        const active = drops.find(d => d.status === 'ACTIVE');
        if (active) {
          setFeaturedDrop({ ...active, isActive: true });
        } else {
          const nextDrop = drops.find(d => d.status === 'SCHEDULED');
          if (nextDrop) {
            setFeaturedDrop({ ...nextDrop, isActive: false });
          }
        }
      } catch (err) {
        console.error("Error fetching drops for hero:", err);
      }
    };
    fetchDrops();
  }, []);

  // Timer Tick Hook
  useEffect(() => {
    if (!featuredDrop) return;
    if (featuredDrop.isActive) {
      setTimeLeft("GO TO DROP");
      return;
    }

    const interval = setInterval(() => {
      const difference = new Date(featuredDrop.startTime) - new Date();
      if (difference <= 0) {
        setTimeLeft("LIVE NOW");
        clearInterval(interval);
        // Refresh page/state to transition to active
        window.location.reload();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const formatted = `${days > 0 ? `${days}d : ` : ""}${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
      setTimeLeft(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [featuredDrop]);

  useEffect(() => {
    const video = videoRef.current;
    const masks = maskRefs.current;

    let isDragging = false;

    let animationFrameId;

    function drawClipped(ctx, video, rect) {
      const videoAspect = video.videoWidth / video.videoHeight;
      const windowAspect = window.innerWidth / window.innerHeight;

      let displayWidth, displayHeight, displayX, displayY;

      if (videoAspect > windowAspect) {
        displayHeight = window.innerHeight;
        displayWidth = displayHeight * videoAspect;
        displayX = (window.innerWidth - displayWidth) / 2;
        displayY = 0;
      } else {
        displayWidth = window.innerWidth;
        displayHeight = displayWidth / videoAspect;
        displayX = 0;
        displayY = (window.innerHeight - displayHeight) / 2;
      }

      const scaleX = video.videoWidth / displayWidth;
      const scaleY = video.videoHeight / displayHeight;

      const sourceX = (rect.left - displayX) * scaleX;
      const sourceY = (rect.top - displayY) * scaleY;
      const sourceWidth = rect.width * scaleX;
      const sourceHeight = rect.height * scaleY;

      ctx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        rect.width,
        rect.height,
      );
    }

    function render() {
      masks.forEach((mask) => {
        const canvas = mask.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const rect = mask.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const w = Math.round(rect.width);
          const h = Math.round(rect.height);
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawClipped(ctx, video, rect);
      });

      animationFrameId = requestAnimationFrame(render);
    }

    function init() {
      video.play().catch(err => console.log("Video play failed or auto-play prevented:", err));
      render();

      Draggable.create(masks, {
        type: "x,y",
        bounds: heroRef.current,
        edgeResistance: 0.9,
        inertia: false,

        onPress() {
          isDragging = true;
        },

        onRelease() {
          isDragging = false;
        },

        onDrag() {
          const rect = this.target.getBoundingClientRect();
          const boxStyle = window.getComputedStyle(this.target);
          const initialLeft = parseFloat(boxStyle.left);
          const initialTop = parseFloat(boxStyle.top);

          const minX = 20 - initialLeft;
          const maxX = window.innerWidth - 20 - initialLeft - rect.width;
          const minY = 68 - initialTop;
          const maxY = window.innerHeight - 20 - initialTop - rect.height;

          if (this.x < minX) {
            this.x = minX;
            gsap.set(this.target, { x: minX });
          } else if (this.x > maxX) {
            this.x = maxX;
            gsap.set(this.target, { x: maxX });
          }

          if (this.y < minY) {
            this.y = minY;
            gsap.set(this.target, { y: minY });
          } else if (this.y > maxY) {
            this.y = maxY;
            gsap.set(this.target, { y: maxY });
          }

          // Dynamically update the coordinate text overlay
          const labelSpan = this.target.querySelector('.coord-label');
          if (labelSpan) {
            const currentLeft = rect.left;
            const currentTop = rect.top;
            labelSpan.textContent = `X:${currentLeft.toFixed(0)}/Y:${currentTop.toFixed(0)}`;
          }
        },
      });
    }

    if (video.readyState >= 2) {
      init();
    } else {
      video.addEventListener("loadeddata", init);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener("loadeddata", init);
    };
  }, []);

  const addMaskRef = (el) => {
    if (el && !maskRefs.current.includes(el)) {
      maskRefs.current.push(el);
    }
  };

  return (
    <>
      <div ref={heroRef} className="hero">
        <div className="hero-corners"></div>

        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          style={{ display: "none" }}
        />

        {boxes.map((box, i) => (
          <div
            key={i}
            ref={addMaskRef}
            className="mask-box"
            style={{
              width: box.width,
              height: box.height,
              top: box.top,
              left: box.left,
            }}
          >
            <span className="coord-label">
              X:{(parseFloat(box.left) || i * 15).toFixed(0)}/Y:{(parseFloat(box.top) || i * 20).toFixed(0)}
            </span>
            <div className="corners"></div>
            <canvas />
          </div>
        ))}

        {featuredDrop && (
          <Link to="/drops" className="hero-countdown-btn">
            <span className="btn-pulse-dot"></span>
            <span className="btn-label">
              {featuredDrop.isActive ? "GATES ARE OPEN" : "THE DESCENSION"}
            </span>
            <span className="btn-timer">{timeLeft}</span>
          </Link>
        )}
      </div>

    </>
  );
}
