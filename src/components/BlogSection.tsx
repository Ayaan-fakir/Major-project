import React from 'react';
import { ARTICLES } from '../data/telemedicineData';
import { Article } from '../types';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface BlogSectionProps {
  onSelectArticle: (article: Article) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onSelectArticle }) => {
  const featuredArticle = ARTICLES[3]; // The fourth article as prominent lead
  const secondaryArticles = ARTICLES.slice(0, 3);

  return (
    <section id="blog" className="py-20 sm:py-28 bg-[#F6F4EE] border-b border-black/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono tracking-wider text-[#1A1A1A] uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"></span>
              <span>Latest Articles</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0E0E10] leading-[1.05]">
              Stay up to date with the <br />
              <span className="font-extrabold">latest medical trends.</span>
            </h2>
          </div>

          <p className="text-[#8C8C88] text-sm sm:text-base max-w-md">
            Peer-reviewed perspectives on cryptographic telemedicine, preventative cardiology, and digital health security.
          </p>
        </div>

        {/* Blog layout matching Alvion video reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Featured Article Card */}
          <div
            onClick={() => onSelectArticle(featuredArticle)}
            className="lg:col-span-5 group cursor-pointer rounded-3xl bg-white border border-black/10 hover:border-black/30 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between text-xs mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#8C8C88]">
                {featuredArticle.category}
              </span>
              <span className="text-[#8C8C88] font-mono">{featuredArticle.readTime}</span>
            </div>

            {/* Date Display */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display font-extrabold text-4xl text-[#0E0E10]">15</span>
              <span className="font-mono text-xs uppercase text-[#8C8C88]">June 2026</span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0E0E10] mb-3 group-hover:text-black">
              {featuredArticle.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#8C8C88] leading-relaxed line-clamp-3 mb-6">
              {featuredArticle.excerpt}
            </p>

            <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-[#0E0E10]">
              <span className="relative pb-0.5 group-hover:text-black">
                Read article
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#0E0E10] group-hover:w-full transition-all duration-200"></span>
              </span>
              <div className="w-8 h-8 rounded-full bg-black/5 group-hover:bg-[#D7FA3B] flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): List of 3 stacked articles */}
          <div className="lg:col-span-7 space-y-4">
            {secondaryArticles.map((article) => {
              const day = article.date.split(' ')[0];
              const monthYear = article.date.split(' ').slice(1).join(' ');

              return (
                <div
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  className="group cursor-pointer rounded-2xl bg-white border border-black/10 hover:border-black/30 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Date Column */}
                  <div className="shrink-0 w-24">
                    <div className="font-display font-bold text-3xl text-[#0E0E10]">
                      {day}
                    </div>
                    <div className="font-mono text-[11px] text-[#8C8C88] uppercase">
                      {monthYear}
                    </div>
                  </div>

                  {/* Title & Category Column */}
                  <div className="flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8C88] block mb-1">
                      {article.category}
                    </span>
                    <h4 className="font-display font-bold text-base sm:text-lg text-[#0E0E10] group-hover:text-black leading-snug">
                      {article.title}
                    </h4>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="shrink-0 w-8 h-8 rounded-full bg-black/5 group-hover:bg-[#D7FA3B] flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-black" />
                  </div>
                </div>
              );
            })}

            {/* Bottom note & See all posts link */}
            <div className="pt-4 flex items-center justify-between text-xs text-[#8C8C88]">
              <span>Find inspiration and knowledge from our latest clinical stories.</span>
              <button
                onClick={() => onSelectArticle(secondaryArticles[0])}
                className="font-semibold text-black hover:underline flex items-center gap-1"
              >
                <span>See all posts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
