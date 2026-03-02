import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, FileCheck, TrendingUp, Star, Check, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── helpers ── */

function Section({ children, className = "", style, id }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section id={id} ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: "easeOut" }} className={className} style={style}>
      {children}
    </motion.section>
  );
}

function FeatureCard({ icon: Icon, title, body, delay }: { icon: React.ElementType; title: string; body: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:-translate-y-1 hover:border-[#2dd4bf]/30 transition-all duration-300">
      <div className="bg-[#2dd4bf]/10 rounded-xl p-3 inline-flex mb-5">
        <Icon size={32} className="text-[#2dd4bf]" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Recoleta', serif" }}>{title}</h3>
      <p className="text-[#94a3b8] leading-relaxed text-[0.9375rem]">{body}</p>
    </motion.div>
  );
}

function StepCard({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}
      className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-left">
      <span className="absolute top-4 right-4 text-5xl font-black text-white/[0.06] select-none">{num}</span>
      <h3 className="text-lg font-bold text-white mb-2 pr-12">{title}</h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ── data ── */

const steps = [
  { num: "01", title: "Patient Books Online", desc: "Your patient selects a Chemist Care Now service via your pharmacy's branded booking portal. Intake form auto-collected before they arrive." },
  { num: "02", title: "Pre-Consult Snapshot", desc: "You see a clean summary: eligibility flags, allergy alerts, recent dispenses, and GP contact status — before you say hello." },
  { num: "03", title: "Guided In-Consult Workflow", desc: "Follow the protocol step-by-step. Decision support, red-flag prompts, and auto-drafted notes appear in real time as you consult." },
  { num: "04", title: "Post-Consult Wrap-Up in 60 Seconds", desc: "eScript generated, GP comms drafted, billing recorded, follow-up scheduled. Done — with a complete audit trail." },
];

const metrics = [
  { value: "12", label: "Consults Today" },
  { value: "$1,840", label: "Revenue Generated" },
  { value: "3", label: "GP Referrals Sent" },
  { value: "5", label: "Follow-ups Scheduled" },
];

const trustBadges = ["Victoria Chemist Care Now ready", "PBS & TGA aligned", "Built for new pharmacist prescribers", "Privacy Act compliant"];

/* ── Waitlist Form ── */

function WaitlistForm({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { toast.error("Please enter a valid email."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("waitlist-signup", { body: { email } });
      if (error) throw error;
      toast.success(data?.message || "You're on the list!");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = variant === "dark";
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@pharmacy.email"
        className={`rounded-xl px-5 py-3.5 flex-1 outline-none text-[0.9375rem] ${isDark ? "bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-[#2dd4bf]/50" : "bg-[#1e293b] border border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#2dd4bf]/50"} transition-colors`} />
      <button type="submit" disabled={loading}
        className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 whitespace-nowrap">
        {loading ? "Joining..." : "Join Waitlist →"}
      </button>
    </form>
  );
}

/* ── Page ── */

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white" style={{ fontFamily: "Inter, system-ui, sans-serif", scrollBehavior: "smooth" }}>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Recoleta', serif" }}>
            ChemistCare<span className="text-[#2dd4bf]">OS</span>
          </span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-[#94a3b8] hover:text-white text-sm transition-colors">How it works</a>
            <a href="#features" className="text-[#94a3b8] hover:text-white text-sm transition-colors">Features</a>
            <button onClick={() => navigate("/dashboard")} className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] font-semibold text-sm px-5 py-2 rounded-lg transition-all">
              Start Prescribing Now
            </button>
          </div>
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0f172a] border-t border-white/5 px-4 py-4 flex flex-col gap-3">
            <a href="#how-it-works" className="text-[#94a3b8] text-sm py-2" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#features" className="text-[#94a3b8] text-sm py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <button onClick={() => navigate("/dashboard")} className="bg-[#2dd4bf] text-[#0f172a] font-semibold text-sm px-5 py-2.5 rounded-lg w-full">Start Prescribing Now</button>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center pt-16 px-4">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #2dd4bf 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-block rounded-full bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] text-sm font-medium px-4 py-1.5 mb-8">
            Now Available in Victoria • Chemist Care Now 2026
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-8 !text-white"
            style={{ fontFamily: "'Recoleta', serif" }}>
            From Registrant to Prescriber-Lead:{" "}
            <span className="text-[#2dd4bf]">Your First-Day-Ready OS</span>{" "}
            for ChemistCare Now
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg text-[#94a3b8] max-w-2xl mb-4 leading-relaxed">
            ChemistCare Prescriber OS is the all-in-one clinical and workflow platform built exclusively for newly registered pharmacist prescribers delivering Chemist Care Now.
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg text-[#94a3b8] max-w-2xl mb-10 leading-relaxed">
            Instant protocols, smart documentation, and practice-ready workflows so you can start prescribing <strong className="text-white">confidently</strong>—not just compliantly.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-start gap-4 mb-10">
            <button onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5">
              Join Early Access Waitlist
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="border border-white/20 text-white bg-white/5 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300">
              Explore the Platform
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-3">
            {trustBadges.map(b => (
              <span key={b} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-[#94a3b8] text-xs px-3 py-1.5 rounded-full">
                <Check size={12} className="text-[#2dd4bf]" />{b}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <Section id="features" className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
            Your Clinical Command Centre
          </h2>
          <p className="text-[#94a3b8] text-lg mb-16 max-w-xl mx-auto">Everything you need for safe, efficient, compliant prescribing — in one place.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard delay={0} icon={ShieldCheck} title="Protocol-Driven Prescribing"
              body="Pre-built Victoria-approved clinical playbooks for UTI, shingles, OCP, skin conditions, school sores, and contraceptive resupply. Instant eligibility screening, red-flag alerts, and decision support." />
            <FeatureCard delay={0.1} icon={FileCheck} title="One-Click Documentation"
              body="Auto-generated SOAP notes, safety flags, GP referral communications, and audit-ready consultation logs. Cut post-consult admin by up to 50%." />
            <FeatureCard delay={0.2} icon={TrendingUp} title="Practice Growth Tools"
              body="Smart patient intake forms, configurable service menus, real-time revenue dashboard, and automated follow-up — turning your credential into a measurable business asset." />
          </div>
        </div>
      </Section>

      {/* ─── HOW IT WORKS ─── */}
      <Section id="how-it-works" className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
            Your First 15-Minute Consult — Streamlined
          </h2>
          <p className="text-[#94a3b8] text-lg mb-16">From booking to billing in four clean steps.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => <StepCard key={s.num} {...s} delay={i * 0.1} />)}
          </div>
          <div className="mt-12 inline-flex items-center gap-2 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] rounded-full px-6 py-3 font-semibold text-sm">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2dd4bf] opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2dd4bf]" /></span>
            UTI Consult — Step 3 of 4 · Sarah M. · Est. 4 min remaining
          </div>
        </div>
      </Section>

      {/* ─── DASHBOARD + SOCIAL PROOF ─── */}
      <Section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 p-10 mb-16">
            <p className="text-sm font-semibold text-[#2dd4bf] mb-6 tracking-wide uppercase">Today's Overview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-4xl md:text-5xl font-black text-white tabular-nums">{m.value}</p>
                  <p className="text-sm text-[#64748b] font-medium mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-8 pt-4 text-center">
              <p className="text-[#475569] text-xs">Live dashboard • Victoria Chemist Care Now compliant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { quote: "This gave me the structure I didn't have after training. Consultations are now half the time with zero second-guessing. I finally feel like a prescriber, not a student.", author: "New Pharmacist Prescriber, Melbourne" },
              { quote: "Protocol playbooks, billing, documentation — all in one screen. I scaled my Chemist Care Now service in the first month. Nothing else comes close.", author: "Victorian Community Pharmacist Prescriber" },
            ].map(t => (
              <div key={t.author} className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="fill-[#facc15] text-[#facc15]" />)}</div>
                <p className="text-[#cbd5e1] leading-relaxed text-[0.9375rem] mb-4">"{t.quote}"</p>
                <p className="text-[#64748b] text-sm font-medium">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── FINAL CTA ─── */}
      <Section id="waitlist" className="py-24 md:py-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
            Ready to Launch Your Prescriber-Led Service?
          </h2>
          <p className="text-[#94a3b8] text-lg mt-4 max-w-xl mx-auto mb-10">
            Be among the first pharmacist prescribers in Victoria to experience the OS built exclusively for Chemist Care Now.
          </p>
          <WaitlistForm variant="dark" />
          <p className="text-[#475569] text-sm mt-4">No spam • Instant confirmation • Early access perks for Victorian prescribers</p>
        </div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-4 text-center">
        <p className="text-white font-bold text-lg" style={{ fontFamily: "'Recoleta', serif" }}>
          ChemistCare<span className="text-[#2dd4bf]">OS</span>
        </p>
        <p className="text-[#64748b] text-sm mt-1">Built for pharmacist prescribers. Built in Australia.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-[#475569] text-xs">
          <span>© 2026 ChemistCare Prescriber OS</span>
          <span>TGA/APRA compliant</span>
          <span>Privacy Act aligned</span>
          <span>Victoria Chemist Care Now & PBS ready</span>
          <a href="mailto:hello@chemistcareos.com" className="hover:text-[#2dd4bf] transition-colors">hello@chemistcareos.com</a>
        </div>
      </footer>
    </div>
  );
}
