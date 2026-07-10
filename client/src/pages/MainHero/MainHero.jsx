import React from 'react'
import Hero from "../../components/Hero/Hero"
import HeroSlider from '../HeroSlider/HeroSlider'
import AboutSection from '../AboutSection/AboutSection'
import TestimonialSection from '../TestimonialSection/TestimonialSection'
import Product from "../../pages/ProductPages/Product"

const MainHero = () => {
  return (
    <div>
      <div className='hide-on-mobile'>
        <Hero />
      </div>
      <HeroSlider />
      <AboutSection />
      <TestimonialSection />
      <Product />
    </div>
  )
}

export default MainHero;
