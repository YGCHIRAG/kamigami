import React from 'react'
import PageMeta from "../../components/PageMeta"
import NavBar from "../../components/AboutComponents/Navbar"
import Hero from "../../components/AboutComponents/Hero"
import About from "../../components/AboutComponents/About"
import Features from "../../components/AboutComponents/Features"
import Story from "../../components/AboutComponents/Story"
import Footer from "../../components/AboutComponents/Footer"
import SEO from '../../components/SEO/Seo'

const AboutPage = () => {
  return (
    <main className="relative min-h-screen w-full">
      <SEO
        title="About KAMIGAMI"
        description="Learn about KAMIGAMI, India's premium clothing brand."
        keywords="about kamigami, Japanese clothing brand"
        url="https://kamigami.in/about-us"
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
