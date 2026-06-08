
import FeatureSection from '../components/FeatureSection';
import PricingSection from '../components/PricingSection';
import TestimonialSection from '../components/TestimonialSection';
import InstructorInfoSection from '../components/InstructorInfoSection';
import InstructorFeedbackSection from '../components/InstructorFeedbackSection';
import TestingCenterMapSection from '../components/TestingCenterMapSection';
import ImageCarousel from '../components/ImageCarousel';

export default function HomePage() {
    return (
      <div className="flex flex-col">
        <ImageCarousel />

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
