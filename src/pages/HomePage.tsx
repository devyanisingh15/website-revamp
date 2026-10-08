import { useSeo } from '@/hooks/useSeo';
import { SEO } from '@/data/seo';
import { Hero } from '@/components/sections/home/Hero';
import { ValueStrip } from '@/components/sections/home/ValueStrip';
import { BiozymeStory } from '@/components/sections/home/BiozymeStory';
import { AuthenticitySection } from '@/components/sections/home/AuthenticitySection';
import { CategoryCarousel } from '@/components/sections/home/CategoryCarousel';
import { Bestsellers } from '@/components/sections/home/Bestsellers';
import { FlavourWall } from '@/components/sections/home/FlavourWall';
import { GoalFinder } from '@/components/sections/home/GoalFinder';
import { Testimonials } from '@/components/sections/home/Testimonials';
import { FitHubTeaser } from '@/components/sections/home/FitHubTeaser';
import { Newsletter } from '@/components/sections/home/Newsletter';

/**
 * One continuous story in seven beats:
 * 01 the product → 02 the science → 03 the proof → 04 the range
 * → 05 your goal → 06 real people → 07 the offer
 */
export default function HomePage() {
  useSeo(SEO.home);
  return (
    <>
      <Hero />
      <ValueStrip />
      <BiozymeStory />
      <AuthenticitySection />
      <CategoryCarousel />
      <Bestsellers />
      <FlavourWall />
      <GoalFinder />
      <Testimonials />
      <FitHubTeaser />
      <Newsletter />
    </>
  );
}
