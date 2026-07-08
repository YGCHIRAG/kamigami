import React from 'react'
import PageMeta from "../../components/PageMeta"
import NavBar from "../../components/AboutComponents/Navbar"
import Hero from "../../components/AboutComponents/Hero"
import About from "../../components/AboutComponents/About"
import Features from "../../components/AboutComponents/Features"
import Story from "../../components/AboutComponents/Story"
import Footer from "../../components/AboutComponents/Footer"

const AboutPage = () => {
  return (
    <main className="relative min-h-screen w-full">
      <PageMeta 
        title="About Us" 
        description="Discover the heritage, philosophical roots, and precision craftsmanship behind Kamigami. Learn how we merge luxury materials with Japanese streetwear styles." 
      />
      <NavBar />
      <Hero />
      <About />
      <Features />
      <Story />
      <Footer />
    </main>
  )
}

export default AboutPage
