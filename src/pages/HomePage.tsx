import HeroCarousel from '../components/HeroCarousel';
import FeatureSection from '../components/FeatureSection';
import PricingSection from '../components/PricingSection';
import TestimonialSection from '../components/TestimonialSection';
import InstructorInfoSection from '../components/InstructorInfoSection';
import InstructorFeedbackSection from '../components/InstructorFeedbackSection';
import TestingCenterMapSection from '../components/TestingCenterMapSection';

export default function HomePage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <HeroCarousel />

            <section id="about">
                <FeatureSection />
            </section>

            <section id="packages">
                <PricingSection />
            </section>

            <section id="testimonial">
                <TestimonialSection />
            </section>

            <InstructorInfoSection />

            <InstructorFeedbackSection />

            <TestingCenterMapSection />
        </div>
    );
}
