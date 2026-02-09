import HeroCarousel from '../components/HeroCarousel';
import FeatureSection from '../components/FeatureSection';
import PricingSection from '../components/PricingSection';
import TestimonialSection from '../components/TestimonialSection';
import InstructorInfoSection from '../components/InstructorInfoSection';

export default function HomePage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <HeroCarousel />

            {/* Features Section */}
            <section id="about">
                <FeatureSection />
            </section>

            {/* Pricing Section */}
            <section id="packages">
                <PricingSection />
            </section>

            {/* Testimonials Section */}
            <section id="testimonial">
                <TestimonialSection />
            </section>

            {/* Instructor Info Section */}
            <InstructorInfoSection />
        </div>
    );
}
