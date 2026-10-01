import React from 'react';
import { Article } from '../types';
import { X, Calendar, Clock, User, Share2, ArrowRight } from 'lucide-react';

interface BlogDetailModalProps {
  article: Article | null;
  onClose: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-[#1A1A1A] rounded-3xl border border-black/10 p-6 sm:p-10 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span className="px-3 py-1 rounded-full bg-black/5 font-mono text-black font-semibold">
            {article.category}
          </span>
          <span className="text-[#8C8C88] flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            {article.date}
          </span>
          <span className="text-[#8C8C88] flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#0E0E10] leading-tight mb-4">
          {article.title}
        </h2>

        <div className="flex items-center gap-2.5 pb-6 border-b border-black/10 mb-6 text-xs text-[#8C8C88]">
          <User className="w-4 h-4 text-black" />
          <span>Written by <strong className="text-black">{article.author}</strong></span>
        </div>

        {/* Content Body */}
        <div className="prose text-sm sm:text-base text-[#1A1A1A] leading-relaxed space-y-4 mb-8">
          {article.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-[#333333]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-black/10 flex items-center justify-between">
          <span className="text-xs text-[#8C8C88] font-mono">
            Aegis Clinical Knowledge Series
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-black text-white hover:bg-black/85 text-xs font-semibold"
          >
            Close Article
          </button>
        </div>
      </div>
    </div>
  );
};
