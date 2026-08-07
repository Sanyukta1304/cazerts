import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import SignatureDesserts from "@/components/SignatureDesserts";
import CakeCanCollection from "@/components/CakeCanCollection";
import WhyChoose from "@/components/WhyChoose";
import Reviews from "@/components/Reviews";
import InstagramFeed from "@/components/InstagramFeed";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <SignatureDesserts />
      <CakeCanCollection />
      <WhyChoose />
      <Reviews />
      <InstagramFeed />
      <Newsletter />
    </>
  );
}