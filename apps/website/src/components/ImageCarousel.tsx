import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { bookingUrl } from '../config';


export default function ImageCarousel() {
  const { company } = useCompany();
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = company?.carouselImages && company.carouselImages.length > 0 ? company.carouselImages.map((ci) => ci.imageUrl) : [];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  return (
    <div className="relative h-[88vh] max-h-[760px] min-h-[560px] w-full overflow-hidden bg-ink">
      {/* Slides */}
      {carouselImages.map((img, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
          <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/65 via-ink/45 to-ink/80" />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <div className="mx-auto max-w-4xl">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur animate-fade-up"
          >
            ★ Trusted local driving school
          </span>
          <h1
            className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl md:text-7xl animate-fade-up"
            style={{ animationDelay: '0.06s' }}
          >
            Master the Road with Confidence
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-light leading-relaxed text-white/85 drop-shadow md:text-xl animate-fade-up"
            style={{ animationDelay: '0.12s' }}
          >
            Professional driving lessons tailored to your needs. Book online in minutes.
          </p>
          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up"
            style={{ animationDelay: '0.18s' }}
          >
            <a
              href={bookingUrl()}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:opacity-95"
            >
              Book Your Lesson
            </a>
            <a
              href="/#packages"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              View Packages
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20">
        <ChevronLeft size={48} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20">
        <ChevronRight size={48} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-primary w-8" : "bg-white/50 hover:bg-white"}`}
          />
        ))}
      </div>
    </div>
  );
}
