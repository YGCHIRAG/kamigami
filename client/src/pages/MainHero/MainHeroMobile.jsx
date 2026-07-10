import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../components/Hero/hero.css";
import videoSrc from "../../assets/videos/LandingPage_compressed.mp4";
import api from "../../services/api";

export default function MainHeroMobile() {
  const [featuredDrop, setFeaturedDrop] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [bgVideo, setBgVideo] = useState(videoSrc);

  // Fetch drops
  useEffect(() => {
    const fetchDrops = async () => {
      try {
        const res = await api.get("/drops");
        const drops = res.data?.data?.drops || [];

        const active = drops.find((d) => d.status === "ACTIVE");

        if (active) {
          setFeaturedDrop({ ...active, isActive: true });
        } else {
          const nextDrop = drops.find((d) => d.status === "SCHEDULED");
          if (nextDrop) {
            setFeaturedDrop({ ...nextDrop, isActive: false });
          }
        }
      } catch (err) {
        console.error("Error fetching drops:", err);
      }
    };

    const fetchCmsSettings = async () => {
      try {
        const res = await api.get('/settings/homepage_cms');
        if (res.data?.value) {
          const mobileVideo = res.data.value.backgroundVideoMobile;
          const desktopVideo = res.data.value.backgroundVideo;
          if (mobileVideo) {
            setBgVideo(mobileVideo);
          } else if (desktopVideo) {
            setBgVideo(desktopVideo);
          }
        }
      } catch (err) {
        console.error("Error fetching homepage cms settings for mobile hero:", err);
      }
    };

    fetchDrops();
    fetchCmsSettings();
  }, []);

  // Countdown
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
        window.location.reload();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${days > 0 ? `${days}d : ` : ""}${String(hours).padStart(
          2,
          "0"
        )}h : ${String(minutes).padStart(2, "0")}m : ${String(
          seconds
        ).padStart(2, "0")}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [featuredDrop]);

  return (
   <div className="hero">
  <div className="hero-corners"></div>

  <div className="hero-video-frame-mobile">
    <video
      className="hero-video-mobile"
      src={bgVideo}
      autoPlay
      muted
      loop
      playsInline
    />
  </div>

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
  );
}