"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  Star,
  Calendar,
  GraduationCap,
  Award,
  MapPin,
  Search,
  X,
  Clock,
  Phone,
  Video,
} from "lucide-react";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    hospital: "City General Hospital",
    experience: "15 years",
    rating: 4.9,
    reviews: 234,
    fee: 75,
    education: ["MD - Cardiology, Harvard Medical School", "MBBS - Johns Hopkins University"],
    expertise: ["Heart Failure", "Coronary Disease", "Interventional Cardiology"],
    languages: ["English", "Spanish"],
    available: true,
    nextSlot: "Today, 4:30 PM",
    consultations: 5200,
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    hospital: "St. Mary&apos;s Medical Center",
    experience: "20 years",
    rating: 4.8,
    reviews: 189,
    fee: 90,
    education: ["MD - Neurology, Stanford University", "MBBS - Yale University"],
    expertise: ["Epilepsy", "Stroke", "Movement Disorders"],
    languages: ["English", "Mandarin"],
    available: true,
    nextSlot: "Tomorrow, 10:00 AM",
    consultations: 7800,
  },
  {
    id: 3,
    name: "Dr. Emily Brown",
    specialty: "Orthopedic Surgeon",
    hospital: "Metro Orthopedic Center",
    experience: "12 years",
    rating: 4.7,
    reviews: 156,
    fee: 85,
    education: ["MS - Orthopedics, Mayo Clinic", "MBBS - Columbia University"],
    expertise: ["Joint Replacement", "Sports Medicine", "Spine Surgery"],
    languages: ["English"],
    available: false,
    nextSlot: "Next Week",
    consultations: 4100,
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Pediatrician",
    hospital: "Children&apos;s Hope Hospital",
    experience: "18 years",
    rating: 4.9,
    reviews: 312,
    fee: 60,
    education: ["MD - Pediatrics, UCLA", "MBBS - University of Michigan"],
    expertise: ["General Pediatrics", "Developmental Disorders", "Allergies"],
    languages: ["English", "French"],
    available: true,
    nextSlot: "Today, 6:00 PM",
    consultations: 9500,
  },
  {
    id: 5,
    name: "Dr. Priya Patel",
    specialty: "Dermatologist",
    hospital: "Green Valley Clinic",
    experience: "10 years",
    rating: 4.8,
    reviews: 201,
    fee: 70,
    education: ["MD - Dermatology, Duke University", "MBBS - Boston University"],
    expertise: ["Cosmetic Dermatology", "Skin Cancer", "Acne Treatment"],
    languages: ["English", "Hindi"],
    available: true,
    nextSlot: "Tomorrow, 2:00 PM",
    consultations: 3200,
  },
  {
    id: 6,
    name: "Dr. Robert Taylor",
    specialty: "General Surgeon",
    hospital: "City General Hospital",
    experience: "22 years",
    rating: 4.9,
    reviews: 445,
    fee: 100,
    education: ["MD - Surgery, Johns Hopkins", "MBBS - University of Pennsylvania"],
    expertise: ["Laparoscopic Surgery", "Cancer Surgery", "Trauma Surgery"],
    languages: ["English"],
    available: true,
    nextSlot: "Today, 5:00 PM",
    consultations: 12000,
  },
];

const specialties = [
  "All",
  "Cardiologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Dermatologist",
  "General Surgeon",
];

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState<(typeof doctors)[0] | null>(
    null
  );

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      activeSpecialty === "All" || doctor.specialty === activeSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <Users className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Our Expert Doctors
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Browse through our network of highly qualified medical professionals
            and book appointments with ease.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setActiveSpecialty(specialty)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeSpecialty === specialty
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="cursor-pointer overflow-hidden transition-all hover:shadow-lg"
              onClick={() => setSelectedDoctor(doctor)}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-primary">{doctor.specialty}</p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.hospital}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{doctor.rating}</span>
                    <span className="text-muted-foreground">
                      ({doctor.reviews})
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {doctor.experience}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      ${doctor.fee}
                    </span>
                    <span className="text-sm text-muted-foreground"> /visit</span>
                  </div>
                  {doctor.available ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Clock className="h-3 w-3" />
                      {doctor.nextSlot}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {doctor.nextSlot}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" size="sm">
                    Book Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Doctor Detail Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setSelectedDoctor(null)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="p-8">
                <div className="flex flex-wrap items-start gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedDoctor.name}
                    </h2>
                    <p className="text-primary">{selectedDoctor.specialty}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">
                          {selectedDoctor.rating}
                        </span>
                        <span className="text-muted-foreground">
                          ({selectedDoctor.reviews} reviews)
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {selectedDoctor.consultations}+ consultations
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {selectedDoctor.hospital}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Education
                    </h3>
                    <ul className="space-y-2">
                      {selectedDoctor.education.map((edu, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                      <Award className="h-5 w-5 text-primary" />
                      Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.expertise.map((exp, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-secondary p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Consultation Fee
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        ${selectedDoctor.fee}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Next Available
                      </p>
                      <p className="font-medium text-foreground">
                        {selectedDoctor.nextSlot}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Languages</p>
                      <p className="font-medium text-foreground">
                        {selectedDoctor.languages.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                  <Button variant="outline">
                    <Video className="mr-2 h-4 w-4" />
                    Video Consult
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

