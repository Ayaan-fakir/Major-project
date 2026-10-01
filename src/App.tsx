/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, AuthUser, Doctor, ServiceItem, Article } from './types';
import { getStoredAuthUser, setStoredAuthUser } from './services/telemedicineStorage';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { SecurityAboutSection } from './components/SecurityAboutSection';
import { DoctorDirectory } from './components/DoctorDirectory';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { AppointmentBooking } from './components/AppointmentBooking';
import { PricingSection } from './components/PricingSection';
import { EmergencyBanner } from './components/EmergencyBanner';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BlogSection } from './components/BlogSection';
import { BlogDetailModal } from './components/BlogDetailModal';
import { ContactAndFAQ } from './components/ContactAndFAQ';
import { Footer } from './components/Footer';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorClinicalPortal } from './components/DoctorClinicalPortal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredAuthUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalRole, setLoginModalRole] = useState<'patient' | 'doctor'>('patient');

  // Modals state
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Doctor | null>(null);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceItem | null>(null);
  const [selectedArticleForModal, setSelectedArticleForModal] = useState<Article | null>(null);

  // Appointment flow state
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDepartment, setBookingDepartment] = useState<string>('Cardiology');

  // Notification toast for booking confirmation
  const [bookingToast, setBookingToast] = useState<{ message: string; ref: string } | null>(null);

  // Listen to auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredAuthUser());
    };
    window.addEventListener('aegis_auth_change', handleAuthChange);
    return () => window.removeEventListener('aegis_auth_change', handleAuthChange);
  }, []);

  const openLogin = (role: 'patient' | 'doctor' = 'patient') => {
    setLoginModalRole(role);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setStoredAuthUser(user);
    setCurrentUser(user);
    if (user.role === 'doctor') {
      setCurrentView('doctor');
    } else {
      setCurrentView('patient');
    }
  };

  const handleLogout = () => {
    setStoredAuthUser(null);
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const scrollToBooking = (doctor?: Doctor, department?: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
    }
    if (doctor) {
      setBookingDoctor(doctor);
      setBookingDepartment(doctor.specialty);
    } else if (department) {
      setBookingDepartment(department);
    }

    setTimeout(() => {
      const el = document.getElementById('booking');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleBookingConfirmed = (details: {
    patientId: string;
    doctor: Doctor;
    date: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    password: string;
    fee: number;
    paymentRef: string;
  }) => {
    // Log them in as THIS newly provisioned patient with their actual name & credentials!
    const newPatientUser: AuthUser = {
      id: details.patientId,
      name: details.patientName,
      role: 'patient',
      emailOrPhone: details.patientEmail || details.patientPhone,
      email: details.patientEmail,
      phone: details.patientPhone,
      password: details.password,
      doctorId: details.doctor.id,
      assignedDoctorIds: [details.doctor.id],
      hasPaidAppointment: true,
    };
    setStoredAuthUser(newPatientUser);
    setCurrentUser(newPatientUser);

    setBookingToast({
      message: `Enclave created for ${details.patientName}. Request sent to ${details.doctor.name} for ${details.date} at ${details.time} (₹${details.fee} Paid)!`,
      ref: details.paymentRef,
    });

    // Automatically transition to the newly provisioned personal patient enclave!
    setCurrentView('patient');

    setTimeout(() => {
      setBookingToast(null);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#1A1A1A] font-sans selection:bg-[#D7FA3B] selection:text-black">
      {/* Global Navigation */}
      <Navbar
        currentView={currentView}
        currentUser={currentUser}
        onNavigate={setCurrentView}
        onOpenBooking={() => scrollToBooking()}
        onOpenLogin={() => openLogin('patient')}
        onLogout={handleLogout}
      />

      {/* Booking confirmation toast */}
      {bookingToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 sm:p-5 rounded-2xl bg-[#0E0E10] text-white border border-[#D7FA3B]/40 shadow-2xl flex items-center gap-3 animate-fade-in text-xs max-w-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D7FA3B] animate-pulse shrink-0"></span>
          <div>
            <div className="font-bold text-[#D7FA3B] font-display text-sm">
              Appointment Booked · {bookingToast.ref}
            </div>
            <div className="text-white/80 mt-0.5">{bookingToast.message}</div>
          </div>
          <button
            onClick={() => setCurrentView('patient')}
            className="ml-auto px-3 py-1.5 rounded-full bg-[#D7FA3B] text-black font-extrabold text-[11px] shrink-0 hover:bg-[#cbf128] transition-colors"
          >
            Open Portal →
          </button>
        </div>
      )}

      {/* VIEW 1: PUBLIC LANDING PAGE (Default for all public visitors) */}
      {currentView === 'landing' && (
        <main>
          {/* Hero Section */}
          <Hero
            onOpenBooking={() => scrollToBooking()}
            onExploreServices={() => {
              const el = document.getElementById('services');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenLogin={(role) => openLogin(role || 'patient')}
          />

          {/* Healthcare Services (12 Departments) */}
          <ServicesSection
            onSelectService={(service) => setSelectedServiceForModal(service)}
            onFilterDoctorSpecialty={(specialty) => {
              const el = document.getElementById('doctors');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Zero-Trust Security & About */}
          <SecurityAboutSection />

          {/* Doctor Directory (12 Specialists) */}
          <DoctorDirectory
            onSelectDoctor={(doctor) => setSelectedDoctorForModal(doctor)}
            onBookDirect={(doctor) => scrollToBooking(doctor)}
          />

          {/* Centerpiece Appointment Booking Flow (Appointment-Wise, Rupee ₹) */}
          <AppointmentBooking
            initialDoctor={bookingDoctor}
            initialDepartment={bookingDepartment}
            onBookingConfirmed={handleBookingConfirmed}
            onEnterPatientPortal={() => setCurrentView('patient')}
          />

          {/* Treatment & Diagnostic Pricing (Appointment-Wise Billing, NO Subscriptions!) */}
          <PricingSection
            onSelectOption={(optionId, fee) => scrollToBooking(undefined, 'General consultation')}
          />

          {/* Testimonials */}
          <TestimonialsSection />

          {/* Emergency Clinical Tele-Triage Banner */}
          <EmergencyBanner
            onTriggerEmergency={() => scrollToBooking(undefined, 'General consultation')}
          />

          {/* Latest Articles / Blog */}
          <BlogSection
            onSelectArticle={(article) => setSelectedArticleForModal(article)}
          />

          {/* Contact & FAQ */}
          <ContactAndFAQ />

          {/* Footer */}
          <Footer
            currentUser={currentUser}
            onNavigate={setCurrentView}
            onOpenBooking={() => scrollToBooking()}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        </main>
      )}

      {/* VIEW 2: PRIVATE PATIENT DASHBOARD */}
      {currentView === 'patient' && currentUser?.role === 'patient' && (
        <PatientDashboard
          currentUser={currentUser}
          onBackToLanding={() => setCurrentView('landing')}
          onOpenBooking={() => {
            setCurrentView('landing');
            setTimeout(() => scrollToBooking(), 100);
          }}
          onLogout={handleLogout}
        />
      )}

      {/* Fallback if user clicked patient view without being logged in */}
      {currentView === 'patient' && currentUser?.role !== 'patient' && (
        <div className="min-h-screen bg-[#0E0E10] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#141416] border border-white/10 text-center space-y-4">
            <h3 className="font-display text-2xl font-bold">Patient Portal Access</h3>
            <p className="text-xs text-[#8C8C88] leading-relaxed">
              Please sign in with your appointment-verified mobile number to access your encrypted records, prescriptions, and direct doctor messaging.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3 rounded-full bg-[#D7FA3B] text-black font-bold text-xs"
              >
                Sign In as Patient
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-xs"
              >
                Back to Website
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PRIVATE DOCTOR CLINICAL PORTAL */}
      {currentView === 'doctor' && currentUser?.role === 'doctor' && (
        <DoctorClinicalPortal
          currentUser={currentUser}
          onBackToLanding={() => setCurrentView('landing')}
          onLogout={handleLogout}
        />
      )}

      {/* Fallback if user clicked doctor view without being logged in */}
      {currentView === 'doctor' && currentUser?.role !== 'doctor' && (
        <div className="min-h-screen bg-[#0E0E10] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#141416] border border-white/10 text-center space-y-4">
            <h3 className="font-display text-2xl font-bold">Doctor Enclave Sign In</h3>
            <p className="text-xs text-[#8C8C88] leading-relaxed">
              Verified Medical Registration (NMC) credential required. Doctors access assigned patient panels with zero platform fee.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3 rounded-full bg-[#D7FA3B] text-black font-bold text-xs"
              >
                Doctor Sign In
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-xs"
              >
                Back to Website
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTICATION / LOGIN MODAL */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onGoToBooking={() => scrollToBooking()}
        initialRole={loginModalRole}
      />

      {/* MODAL 1: Doctor Detail Modal */}
      <DoctorDetailModal
        doctor={selectedDoctorForModal}
        onClose={() => setSelectedDoctorForModal(null)}
        onBookWithDoctor={(doctor) => {
          setSelectedDoctorForModal(null);
          scrollToBooking(doctor);
        }}
      />

      {/* MODAL 2: Service Detail Modal */}
      <ServiceDetailModal
        service={selectedServiceForModal}
        onClose={() => setSelectedServiceForModal(null)}
        onBookDepartment={(dept) => {
          setSelectedServiceForModal(null);
          scrollToBooking(undefined, dept);
        }}
      />

      {/* MODAL 3: Blog Detail Modal */}
      <BlogDetailModal
        article={selectedArticleForModal}
        onClose={() => setSelectedArticleForModal(null)}
      />
    </div>
  );
}
