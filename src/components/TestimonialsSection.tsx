import React from 'react';
import { TESTIMONIALS } from '../data/telemedicineData';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-[#0E0E10] text-white border-b border-white/10 relative overflow-hidden">
      {/* Decorative bracket motifs */}
      <div className="absolute right-10 top-10 text-white/5 font-mono text-[140px] pointer-events-none select-none">
        {'{ }'}
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-wider text-[#D7FA3B] uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B]"></span>
            <span>Patient Testimonials</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
            Trusted healthcare, <br />
            <span className="font-extrabold text-[#D7FA3B]">trusted voices.</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => {
            return (
              <div
                key={idx}
                className={`p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                  t.featured
                    ? 'bg-[#18181B] border-2 border-[#D7FA3B] shadow-2xl md:scale-105'
                    : 'bg-[#141416] border border-white/10 shadow-lg'
                }`}
              >
                <div>
                  {/* Rating Stars & Quote Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1 text-[#D7FA3B]">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D7FA3B]" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-white/20" />
                  </div>

                  <p className="text-sm sm:text-base text-white/90 leading-relaxed italic mb-8">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-6 border-t border-white/10 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-sm text-[#D7FA3B]">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-white">
                      {t.author}
                    </div>
                    <div className="text-xs text-[#8C8C88]">{t.location}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
