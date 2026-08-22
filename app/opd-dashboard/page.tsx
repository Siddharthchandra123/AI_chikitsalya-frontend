"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Search,
  RefreshCw
} from "lucide-react";

export default function OPDDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/opd');
      const data = await res.json();
      // Filter to only show "confirmed" (waiting) bookings
      setBookings(data.filter((b: any) => b.status === 'confirmed'));
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async (id: string) => {
    try {
      const res = await fetch('/api/opd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'used' })
      });
      if (res.ok) {
        // Remove from local state
        setBookings(bookings.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Waiting Tokens Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage active OPD appointments</p>
          </div>
          <Button variant="outline" onClick={fetchBookings}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.length === 0 && !loading ? (
            <div className="col-span-full py-20 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <p className="mt-4 text-muted-foreground">No waiting patients at the moment.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="p-6 border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{booking.patient.name}</h3>
                    <p className="text-sm text-primary font-mono font-bold">{booking.id}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3" />
                    {booking.time}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-medium">{booking.doctor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dept:</span>
                    <span className="font-medium">{booking.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{booking.patient.phone}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => markAsUsed(booking.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

