"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";


const departments = [
  { id: "general", name: "General Medicine", icon: "🩺" },
  { id: "cardio", name: "Cardiology", icon: "❤️" },
  { id: "ortho", name: "Orthopedics", icon: "🦴" },
  { id: "neuro", name: "Neurology", icon: "🧠" },
  { id: "derma", name: "Dermatology", icon: "🧬" },
  { id: "ent", name: "ENT", icon: "👂" },
  { id: "pediatric", name: "Pediatrics", icon: "👶" },
  { id: "dental", name: "Dental", icon: "🦷" },
];

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    experience: "15 years",
    rating: 4.9,
    reviews: 234,
    available: true,
    nextSlot: "Today, 2:00 PM",
    fee: 50,
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    experience: "20 years",
    rating: 4.8,
    reviews: 189,
    available: true,
    nextSlot: "Tomorrow, 10:00 AM",
    fee: 75,
  },
  {
    id: 3,
    name: "Dr. Emily Brown",
    specialty: "Orthopedics",
    experience: "12 years",
    rating: 4.7,
    reviews: 156,
    available: false,
    nextSlot: "Next Week",
    fee: 60,
  },
];

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

export default function OPDBookingPage() {
  const [step, setStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState({ name: "", phone: "", email: "" });
  const [isVerified, setIsVerified] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  const handleVerify = () => {
    if (userDetails.name && userDetails.phone) {
      setIsVerified(true);
      setStep(3);
    } else {
      alert("Please enter your name and phone number for verification.");
    }
  };

  const handleBooking = async () => {
    setIsBooking(true);
    const doctor = doctors.find((d) => d.id === selectedDoctor);
    const dept = departments.find((d) => d.id === selectedDept);

    const payload = {
      patient: userDetails,
      doctor: doctor?.name,
      department: dept?.name,
      date: selectedDate?.toDateString(),
      time: selectedTime,
      fee: doctor?.fee
    };

    try {
      const res = await fetch('/api/opd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setBookingResult(data.booking);
        setStep(5);
      }
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const downloadPDF = () => {
    if (!bookingResult) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(34, 197, 94); // Green primary color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("AI CHIKITSALYA - OPD TOKEN", 105, 25, { align: "center" });

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`Booking ID: ${bookingResult.id}`, 20, 60);
    doc.setFontSize(12);
    doc.text(`Date: ${bookingResult.date}`, 20, 75);
    doc.text(`Time: ${bookingResult.time}`, 20, 85);

    doc.setFontSize(14);
    doc.text("PATIENT DETAILS", 20, 105);
    doc.setFontSize(12);
    doc.text(`Name: ${bookingResult.patient.name}`, 20, 115);
    doc.text(`Phone: ${bookingResult.patient.phone}`, 20, 125);

    doc.setFontSize(14);
    doc.text("DOCTOR & DEPARTMENT", 20, 145);
    doc.setFontSize(12);
    doc.text(`Doctor: ${bookingResult.doctor}`, 20, 155);
    doc.text(`Dept: ${bookingResult.department}`, 20, 165);

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 200, 190, 200);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Please bring this token to the hospital 15 minutes before your slot.", 105, 210, { align: "center" });
    doc.text("AI Chikitsalya - Your Healthcare Companion", 105, 220, { align: "center" });

    doc.save(`Token_${bookingResult.id}.pdf`);
  };



  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <Calendar className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            OPD Appointment Booking
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Book an outpatient appointment with our expert doctors in just a few
            simple steps.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 5 && (
                  <div
                    className={`mx-2 h-0.5 w-12 ${
                      step > s ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-8 text-xs text-muted-foreground">
            <span>Department</span>
            <span>Identity</span>
            <span>Doctor</span>
            <span>Schedule</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Step 1: Department Selection */}
        {step === 1 && (
          <Card className="mx-auto max-w-4xl p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Select Department
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    selectedDept === dept.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{dept.icon}</span>
                  <span
                    className={`text-sm font-medium ${
                      selectedDept === dept.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {dept.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedDept}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: User Verification */}
        {step === 2 && (
          <Card className="mx-auto max-w-md p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground text-center">
              Identity Verification
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                  className="w-full mt-1 p-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <input 
                  type="tel" 
                  value={userDetails.phone}
                  onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                  className="w-full mt-1 p-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleVerify}>
                Verify & Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Doctor Selection */}
        {step === 3 && (
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={`cursor-pointer p-6 transition-all ${
                    selectedDoctor === doctor.id ? "ring-2 ring-primary" : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedDoctor(doctor.id)}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                        {doctor.available && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Available</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doctor.specialty} • {doctor.experience}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">${doctor.fee}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(4)} disabled={!selectedDoctor}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Schedule Selection */}
        {step === 4 && (
          <Card className="mx-auto max-w-4xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            </div>
            <h2 className="mb-6 text-lg font-semibold text-foreground">Select Date & Time</h2>
            <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
              {dates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex min-w-[80px] flex-col items-center rounded-xl border-2 p-3 transition-all ${
                    selectedDate?.toDateString() === date.toDateString() ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                  <span className="text-lg font-semibold text-foreground">{date.getDate()}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                    selectedTime === slot ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleBooking} disabled={!selectedDate || !selectedTime || isBooking}>
                {isBooking ? "Booking..." : "Confirm Appointment"}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && bookingResult && (
          <Card className="mx-auto max-w-md p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Booking Confirmed!</h2>
            <p className="mb-6 text-muted-foreground">
              Hello {bookingResult.patient.name}, your appointment is secured.
            </p>
            <div className="mb-6 rounded-lg bg-secondary p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">{bookingResult.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{bookingResult.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{bookingResult.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono text-primary font-bold">{bookingResult.id}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={downloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setStep(1);
                  setSelectedDept(null);
                  setSelectedDoctor(null);
                  setSelectedDate(null);
                  setSelectedTime(null);
                  setBookingResult(null);
                }}
              >
                Book Another
              </Button>
            </div>
          </Card>
        )}


      </main>
      <Footer />
    </div>
  );
}


