import React, { useState } from 'react';
import { FAQS } from '../data/telemedicineData';
import { saveClinicalInquiry } from '../services/telemedicineStorage';
import { ChevronDown, Phone, Mail, MapPin, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ContactAndFAQ: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCategory, setFormCategory] = useState<'General Clinical' | 'Specialist Routing' | 'Security & Enclave' | 'Diagnostic Inquiry'>('General Clinical');
  const [formSubject, setFormSubject] = useState('Cardiology Tele-Consultation Inquiry');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) return;

    saveClinicalInquiry({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      category: formCategory,
      subject: formSubject.trim() || 'Pre-Booking Clinical Inquiry',
      message: formMessage.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormMessage('');
    }, 5000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#0E0E10] text-white border-b border-white/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (6 cols): Contact Form */}
          <div className="lg:col-span-6 p-8 sm:p-10 rounded-3xl bg-[#141416] border border-white/10 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-wider text-[#D7FA3B] uppercase mb-4">
              <span>Get In Touch · India Clinical Desk</span>
            </div>

            <h3 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
              Need care or have a clinical query?
            </h3>
            <p className="text-xs sm:text-sm text-[#8C8C88] mb-8 leading-relaxed">
              Our clinical desk operates 24/7 across Indian metros. Inquire about specialists, upload assistance, or appointment scheduling.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                    Full name*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                    Email address*
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aarav@example.in"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                    Phone (Indian Mobile)*
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                    Select department*
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors"
                  >
                    <option value="Cardiology Consultation">Cardiology (AIIMS)</option>
                    <option value="General Checkup">General &amp; Family Care (CMC)</option>
                    <option value="Neurology">Neurology (NIMHANS)</option>
                    <option value="Orthopedics">Orthopedics &amp; Joint Care</option>
                    <option value="Records / Blackbox Inquiry">Records / Blackbox Upload Inquiry</option>
                    <option value="Oncology Second Opinion">Oncology (Tata Memorial)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Tell us little about your health condition
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter details of symptoms, investigations done, or preferred specialist..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={submitted}
                  className="px-8 py-3.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs tracking-tight transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  {submitted ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Inquiry Dispatched</span>
                    </span>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="text-xs font-mono text-[#8C8C88]">
                  Registered Patient?{' '}
                  <span className="text-[#D7FA3B] underline cursor-pointer hover:text-white">
                    Check your case status
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column (6 cols): FAQ Accordion & Quick Contact */}
          <div className="lg:col-span-6 space-y-8" id="faq">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-wider text-[#D7FA3B] uppercase mb-4">
                <span>Frequently Asked Questions</span>
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
                Clear answers on pricing, uploads &amp; privacy.
              </h3>
              <p className="text-xs sm:text-sm text-[#8C8C88] leading-relaxed">
                Everything you need to know about appointment-based billing, upload capabilities, cross-role messaging, and in-RAM Blackbox document protection.
              </p>
            </div>

            {/* Accordion list */}
            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-[#141416] border border-white/10 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-white hover:text-[#D7FA3B] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#D7FA3B]' : 'text-[#8C8C88]'
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#8C8C88] leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick contact mini-card in Indian context */}
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#D7FA3B]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[#8C8C88] uppercase text-[10px]">Toll-Free Clinical Desk</div>
                  <div className="text-white font-semibold">+91 1800 202 8899</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#D7FA3B]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[#8C8C88] uppercase text-[10px]">Encrypted Inbound</div>
                  <div className="text-white font-semibold">care@aegis-health.in</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
