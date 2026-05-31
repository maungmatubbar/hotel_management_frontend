import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const contactItems = [
  { title: "Call reservations", detail: "+880 1712-345678", icon: Phone },
  { title: "Email support", detail: "support@hotelos.com", icon: Mail },
  { title: "Front desk hours", detail: "Open 24 hours", icon: Clock },
  { title: "Hotel office", detail: "Gulshan, Dhaka, Bangladesh", icon: MapPin },
];

export default function ContactPage() {
  return (
    <main className="hotel-page-bg text-slate-950 dark:text-slate-50">
      <Navbar />
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="inverted">Contact us</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
            Talk to the hotel team about rooms, bookings, or support.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            Reach out for room availability, booking assistance, payment questions, or hotel
            management platform support.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.6fr_0.4fr] lg:px-8">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold">Send a message</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            This form is ready for UI collection. Connect it to your preferred support endpoint when needed.
          </p>
          <form className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" placeholder="Your name" />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="+880..." />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="Booking support, room inquiry, or platform help" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="How can we help?"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300"
              />
            </div>
            <Button type="button" className="w-fit">
              <Send className="h-4 w-4" />
              Send message
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {contactItems.map((item) => (
            <Card key={item.title} className="p-5">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.detail}</p>
                </div>
              </div>
            </Card>
          ))}
          <Card className="bg-slate-950 p-6 text-white dark:bg-slate-900">
            <h2 className="text-xl font-semibold">Need to book now?</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Browse live room inventory and continue directly to checkout with your stay dates.
            </p>
            <Link
              href="/rooms"
              className={cn(buttonVariants(), "mt-5 bg-white text-slate-950 hover:bg-slate-100")}
            >
              Browse rooms
            </Link>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  );
}
