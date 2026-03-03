import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ShieldCheck, FileCheck, TrendingUp, Check, Menu, X,
  Lock, Server, Eye, ClipboardList, ChevronDown, ChevronUp,
  Stethoscope, BarChart3, Zap, ExternalLink, Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── Animated Section wrapper ── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section id={id} ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: "easeOut" }} className={className}>
      {children}
    </motion.section>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon: Icon, title, body, delay }: { icon: React.ElementType; title: string; body: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:-translate-y-1 hover:border-[#2dd4bf]/30 transition-all duration-300">
      <div className="bg-[#2dd4bf]/10 rounded-xl p-3 inline-flex mb-5">
        <Icon size={28} className="text-[#2dd4bf]" />
      </div>
      <h3 className="text-xl font-bold !text-white mb-3" style={{ fontFamily: "'Recoleta', serif" }}>{title}</h3>
      <p className="text-[#94a3b8] leading-relaxed text-[0.9375rem]">{body}</p>
    </motion.div>
  );
}

/* ── Step Card ── */
function StepCard({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}
      className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-left">
      <span className="absolute top-4 right-4 text-5xl font-black text-white/[0.06] select-none">{num}</span>
      <h3 className="text-lg font-bold !text-white mb-2 pr-12">{title}</h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ── FAQ Accordion ── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="!text-white font-semibold text-[0.9375rem] pr-4">{q}</span>
        {open ? <ChevronUp size={18} className="text-[#2dd4bf] shrink-0" /> : <ChevronDown size={18} className="text-[#94a3b8] shrink-0" />}
      </button>
      {open && <p className="text-[#94a3b8] text-sm leading-relaxed pb-5 pr-8">{a}</p>}
    </div>
  );
}

/* ── Data ── */
const steps = [
  { num: "01", title: "Patient Books Online", desc: "Patients select a ChemistCare PrescriberOS service via your branded booking portal. Intake forms are auto-collected before arrival." },
  { num: "02", title: "Pre-Consult Snapshot", desc: "Review eligibility flags, allergy alerts, recent dispenses, and GP contact status — before you start the consult." },
  { num: "03", title: "Guided In-Consult Workflow", desc: "Follow protocol step-by-step with decision support, red-flag prompts, and auto-drafted notes in real time." },
  { num: "04", title: "Post-Consult in 60 Seconds", desc: "eScript generated, GP comms drafted, billing recorded, follow-up scheduled — with a complete audit trail." },
];

const metrics = [
  { value: "12", label: "Consults Today" },
  { value: "$1,840", label: "Revenue Generated" },
  { value: "3", label: "GP Referrals Sent" },
  { value: "5", label: "Follow-ups Scheduled" },
];

const faqs = [
  { q: "How long does setup take?", a: "Most pharmacies are live within 48 hours. We handle onboarding, protocol configuration, and staff training remotely — no IT team required." },
  { q: "How does ChemistCare PrescriberOS handle data security?", a: "All data is hosted on Australian-based infrastructure with encryption at rest and in transit, role-based access controls, full audit trails, and a defined data retention policy. We are designed to support Privacy Act 1988 and APPs compliance." },
  { q: "Does it integrate with existing dispensing systems?", a: "ChemistCare PrescriberOS is designed to complement your existing POS/dispensing system. We provide structured exports and are actively developing direct integrations with major Australian pharmacy platforms." },
  { q: "What does it cost?", a: "We offer transparent per-pharmacy pricing with no lock-in contracts. Early access partners receive founding-member rates. Book a demo to discuss your specific needs." },
  { q: "Is this aligned with AHPRA and TGA requirements?", a: "Yes. ChemistCare PrescriberOS is designed to support compliance with AHPRA professional standards and TGA requirements for pharmacist prescribing under Structured Prescribing Arrangements. Our protocols are reviewed by practising pharmacist prescribers." },
];

const securityFeatures = [
  { icon: Server, title: "Australian Data Residency", desc: "All patient and clinical data hosted on Australian-based infrastructure." },
  { icon: Lock, title: "Encryption at Rest & In Transit", desc: "AES-256 encryption for stored data, TLS 1.3 for all data in transit." },
  { icon: Eye, title: "Role-Based Access Controls", desc: "Granular permissions ensuring staff only access data relevant to their role." },
  { icon: ClipboardList, title: "Audit Trails & Data Retention", desc: "Comprehensive activity logging with configurable data retention policies." },
];

const roles = [
  { value: "", label: "Select your role" },
  { value: "intern", label: "Pharmacy Intern" },
  { value: "pharmacist", label: "Registered Pharmacist" },
  { value: "prescriber", label: "Pharmacist Prescriber" },
  { value: "owner", label: "Pharmacy Owner / Manager" },
  { value: "other", label: "Other" },
];

/* ── Enhanced Waitlist Form ── */
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { toast.error("Please enter a valid email."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("waitlist-signup", {
        body: { email, role: role || undefined, pharmacy_name: pharmacyName || undefined },
      });
      if (error) throw error;
      toast.success(data?.message || "You're on the list!");
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2dd4bf]/10 mb-4">
          <Check size={32} className="text-[#2dd4bf]" />
        </div>
        <h3 className="text-2xl font-bold !text-white mb-2" style={{ fontFamily: "'Recoleta', serif" }}>You're on the list!</h3>
        <p className="text-[#94a3b8]">We'll be in touch shortly with early access details.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@pharmacy.com.au" required
        className="w-full rounded-xl px-5 py-3.5 bg-white/10 border border-white/20 !text-white placeholder:text-white/40 focus:border-[#2dd4bf]/50 outline-none text-[0.9375rem] transition-colors" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={role} onChange={e => setRole(e.target.value)}
          className="rounded-xl px-5 py-3.5 bg-white/10 border border-white/20 !text-white outline-none text-[0.9375rem] transition-colors focus:border-[#2dd4bf]/50 appearance-none">
          {roles.map(r => <option key={r.value} value={r.value} className="bg-[#0f172a] text-white">{r.label}</option>)}
        </select>
        <input type="text" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} placeholder="Pharmacy name (optional)"
          className="rounded-xl px-5 py-3.5 bg-white/10 border border-white/20 !text-white placeholder:text-white/40 focus:border-[#2dd4bf]/50 outline-none text-[0.9375rem] transition-colors" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 text-base">
        {loading ? "Joining..." : "Join the Waitlist →"}
      </button>
    </form>
  );
}

/* ── Page ── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", scrollBehavior: "smooth" }}>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Recoleta', serif" }}>
            ChemistCare Prescriber<span className="text-[#2dd4bf]">OS</span>
          </span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[#94a3b8] hover:text-white text-sm transition-colors">Features</a>
            <a href="#how-it-works" className="text-[#94a3b8] hover:text-white text-sm transition-colors">How It Works</a>
            <a href="#security" className="text-[#94a3b8] hover:text-white text-sm transition-colors">Security</a>
            <a href="#faq" className="text-[#94a3b8] hover:text-white text-sm transition-colors">FAQ</a>
            <button onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] font-semibold text-sm px-5 py-2 rounded-lg transition-all">
              Join the Waitlist
            </button>
          </div>
          <button className="md:hidden !text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0f172a] border-t border-white/5 px-4 py-4 flex flex-col gap-3">
            <a href="#features" className="text-[#94a3b8] text-sm py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-[#94a3b8] text-sm py-2" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#security" className="text-[#94a3b8] text-sm py-2" onClick={() => setMenuOpen(false)}>Security</a>
            <a href="#faq" className="text-[#94a3b8] text-sm py-2" onClick={() => setMenuOpen(false)}>FAQ</a>
            <button onClick={() => { setMenuOpen(false); document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }); }}
              className="bg-[#2dd4bf] text-[#0f172a] font-semibold text-sm px-5 py-2.5 rounded-lg w-full">Join the Waitlist</button>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center pt-16 px-4">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #2dd4bf 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-block rounded-full bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] text-sm font-medium px-4 py-1.5 mb-8">
            Now Available in Victoria • Early Access 2026
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 !text-white"
            style={{ fontFamily: "'Recoleta', serif" }}>
            Start ChemistCare Prescriber<span className="text-[#2dd4bf]">OS</span> Consults{" "}
            <span className="text-[#2dd4bf]">in Days, Not Weeks</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed">
            The clinical and workflow platform built for pharmacist prescribers. Protocol-driven prescribing, automated documentation, and practice-ready workflows — so you prescribe <strong className="!text-white">confidently</strong>, not just compliantly.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5">
              Join the Waitlist
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="border border-white/20 !text-white bg-white/5 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300">
              Start Prescribing <span className="text-[#2dd4bf]">Now</span> →
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-3">
            {["Designed to support AHPRA & TGA compliance", "PBS-aligned protocols", "Privacy Act ready", "Victorian SPA compatible"].map(b => (
              <span key={b} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-[#94a3b8] text-xs px-3 py-1.5 rounded-full">
                <Check size={12} className="text-[#2dd4bf]" />{b}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF STATS STRIP ─── */}
      <Section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "62,000+", label: "Services across 800+ VIC chemists", source: "Chemist Care Now / Vic Health", href: "https://www.health.vic.gov.au/news/chemist-care-now-is-expanding-to-treat-more-conditions" },
              { value: "23,000+", label: "Pilot services in first 12 months — no serious safety concerns", source: "Vic Pilot Summary", href: "https://www.health.vic.gov.au/publications/victorian-community-pharmacist-statewide-pilot-summary-report" },
              { value: "12,000+", label: "NSW trial consultations milestone", source: "NSW Health", href: "https://www.health.nsw.gov.au/news/Pages/20240305_00.aspx" },
              { value: "18", label: "National Scope of Practice Review recommendations", source: "Australian Govt", href: "https://www.health.gov.au/our-work/scope-of-practice-review" },
            ].map((s, i) => (
              <motion.div key={s.value} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <p className="text-3xl md:text-4xl font-black !text-white tabular-nums mb-2">{s.value}</p>
                <p className="text-[#94a3b8] text-sm leading-snug mb-3">{s.label}</p>
                <a href={s.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#2dd4bf] text-xs font-medium hover:underline">
                  {s.source} <ExternalLink size={10} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── FEATURES ─── */}
      <Section id="features" className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#2dd4bf] text-sm font-semibold tracking-wide uppercase mb-3">Platform Capabilities</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
            Your Clinical Command Centre
          </h2>
          <p className="text-[#94a3b8] text-lg mb-16 max-w-xl mx-auto">Everything you need for safe, efficient prescribing — in one place.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard delay={0} icon={Stethoscope} title="Protocol-Driven Prescribing"
              body="Victoria-approved clinical playbooks for UTI, shingles, OCP, skin conditions, and more. Instant eligibility screening, red-flag alerts, and real-time decision support." />
            <FeatureCard delay={0.1} icon={FileCheck} title="One-Click Documentation"
              body="Auto-generated SOAP notes, GP referral comms, and audit-ready logs. Reduce post-consult admin by up to 50% with structured, compliant records." />
            <FeatureCard delay={0.2} icon={BarChart3} title="Practice Growth Engine"
              body="Smart patient intake, real-time revenue dashboards, automated follow-ups, and configurable service menus. Turn your credential into a measurable business asset." />
          </div>
        </div>
      </Section>

      {/* ─── HOW IT WORKS ─── */}
      <Section id="how-it-works" className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#2dd4bf] text-sm font-semibold tracking-wide uppercase mb-3">Workflow</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
            Your First Consult — Streamlined
          </h2>
          <p className="text-[#94a3b8] text-lg mb-16">From booking to billing in four steps.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => <StepCard key={s.num} {...s} delay={i * 0.1} />)}
          </div>
          <div className="mt-12 inline-flex items-center gap-2 bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] rounded-full px-6 py-3 font-semibold text-sm">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2dd4bf] opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2dd4bf]" /></span>
            Live Demo — UTI Consult · Step 3 of 4 · Est. 4 min remaining
          </div>
        </div>
      </Section>

      {/* ─── DASHBOARD PREVIEW ─── */}
      <Section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#2dd4bf] text-sm font-semibold tracking-wide uppercase mb-3">Live Dashboard</p>
            <h2 className="text-3xl md:text-5xl font-bold !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
              Real-Time Practice Intelligence
            </h2>
          </div>
          <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 p-10">
            <p className="text-sm font-semibold text-[#2dd4bf] mb-6 tracking-wide uppercase">Today's Overview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-4xl md:text-5xl font-black !text-white tabular-nums">{m.value}</p>
                  <p className="text-sm text-[#64748b] font-medium mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-8 pt-4 text-center">
              <p className="text-[#475569] text-xs">Simulated dashboard • Updated in real time when live</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── SECURITY & COMPLIANCE ─── */}
      <Section id="security" className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2dd4bf] text-sm font-semibold tracking-wide uppercase mb-3">Security & Privacy</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
              Built for Clinical-Grade Trust
            </h2>
            <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">Designed to support compliance with Privacy Act 1988, AHPRA professional standards, and TGA requirements for pharmacist prescribing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((sf, i) => (
              <motion.div key={sf.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center">
                <div className="bg-[#2dd4bf]/10 rounded-xl p-3 inline-flex mb-4">
                  <sf.icon size={24} className="text-[#2dd4bf]" />
                </div>
                <h3 className="text-sm font-bold !text-white mb-2">{sf.title}</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">{sf.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── SOCIAL PROOF ─── */}
      <Section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#2dd4bf] text-sm font-semibold tracking-wide uppercase mb-3">Early Feedback</p>
            <h2 className="text-3xl md:text-5xl font-bold !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
              What Early Partners Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { quote: "This gave me the clinical structure I needed after completing my prescriber training. Consultations are now half the time with zero second-guessing.", author: "Pharmacist Prescriber", location: "Burke Road Pharmacy, Melbourne" },
              { quote: "Protocol playbooks, billing, documentation — all in one screen. We scaled our prescribing service in the first month. Nothing else comes close for pharmacy.", author: "Pharmacy Owner", location: "Community Pharmacy, Victoria" },
            ].map(t => (
              <div key={t.location} className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                <Zap size={20} className="text-[#2dd4bf] mb-4" />
                <p className="text-[#cbd5e1] leading-relaxed text-[0.9375rem] mb-4 italic">"{t.quote}"</p>
                <p className="!text-white text-sm font-semibold">{t.author}</p>
                <p className="text-[#64748b] text-sm">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── IN THE MEDIA / POLICY MOMENTUM ─── */}
      <Section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2dd4bf] text-sm font-semibold tracking-wide uppercase mb-3">In the Media</p>
            <h2 className="text-3xl md:text-5xl font-bold !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
              Policy Momentum Is Building
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Chemist Care Now Expanding", summary: "Victoria is expanding its pharmacist prescribing program to treat more conditions across 800+ pharmacies.", href: "https://www.health.vic.gov.au/news/chemist-care-now-is-expanding-to-treat-more-conditions" },
              { title: "VIC Pilot Summary Report", summary: "23,000+ services delivered safely in the first 12 months with no serious safety concerns reported.", href: "https://www.health.vic.gov.au/publications/victorian-community-pharmacist-statewide-pilot-summary-report" },
              { title: "Community Pharmacist Program", summary: "Victoria's community pharmacist program continues to expand access to healthcare across the state.", href: "https://www.health.vic.gov.au/primary-care/community-pharmacist-program" },
              { title: "National Scope of Practice Review", summary: "18 recommendations from the Australian Government to expand pharmacist scope of practice nationally.", href: "https://www.health.gov.au/our-work/scope-of-practice-review" },
              { title: "NSW Trial Hits 12,000 Consultations", summary: "NSW pharmacist prescribing pilot reaches a major milestone with 12,000+ patient consultations.", href: "https://www.health.nsw.gov.au/news/Pages/20240305_00.aspx" },
              { title: "Queensland Pharmacist Prescribing", summary: "Queensland announces expanded scope of practice for pharmacists to improve community healthcare access.", href: "https://statements.qld.gov.au/statements/102216" },
            ].map((item, i) => (
              <motion.a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-[#2dd4bf]/30 transition-all duration-300 block">
                <h3 className="text-base font-bold !text-white mb-2 group-hover:text-[#2dd4bf] transition-colors" style={{ fontFamily: "'Recoleta', serif" }}>{item.title}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">{item.summary}</p>
                <span className="inline-flex items-center gap-1.5 text-[#2dd4bf] text-sm font-medium">
                  Read more <ExternalLink size={12} />
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── MEDIA LOGOS ─── */}
      <Section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#64748b] text-xs font-medium tracking-wide uppercase mb-8">As referenced by leading industry & government bodies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {["ABC News", "AJP", "PSA", "Pharmacy Guild", "Better Health Channel"].map(name => (
              <span key={name} className="text-[#475569] text-sm font-semibold tracking-wide uppercase opacity-60 hover:opacity-100 transition-opacity">
                {name}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── VIDEO SOCIAL PROOF ─── */}
      <Section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2dd4bf] text-sm font-semibold tracking-wide uppercase mb-3">See the Buzz</p>
            <h2 className="text-3xl md:text-5xl font-bold !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
              See What the Buzz Is About
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "https://www.youtube.com/embed/bN94eaY-QDE",
              "https://www.youtube.com/embed/Xsn3XCPSCMY",
              "https://www.youtube.com/embed/w1g3t7013hs",
            ].map((url, i) => (
              <motion.div key={url} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe src={url} title={`Video ${i + 1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                    className="absolute inset-0 w-full h-full" loading="lazy" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── FAQ ─── */}
      <Section id="faq" className="py-24 md:py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#2dd4bf] text-sm font-semibold tracking-wide uppercase mb-3">Common Questions</p>
            <h2 className="text-3xl md:text-5xl font-bold !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl px-8">
            {faqs.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </Section>

      {/* ─── FINAL CTA / WAITLIST ─── */}
      <Section id="waitlist" className="py-24 md:py-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 !text-white" style={{ fontFamily: "'Recoleta', serif" }}>
            Ready to Transform Your Prescribing Practice?
          </h2>
          <p className="text-[#94a3b8] text-lg mt-4 max-w-xl mx-auto mb-10">
            Join the waitlist and be among the first to experience ChemistCare Prescriber<span className="text-[#2dd4bf]">OS</span> when we launch.
          </p>
          <WaitlistForm />
          <p className="text-[#475569] text-sm mt-4">No spam • Instant confirmation • Early access rates for founding partners</p>
        </div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="!text-white font-bold text-lg" style={{ fontFamily: "'Recoleta', serif" }}>
                ChemistCare Prescriber<span className="text-[#2dd4bf]">OS</span>
              </p>
              <p className="text-[#64748b] text-sm mt-1">Clinical workflow software for pharmacist prescribers. Built in Australia.</p>
            </div>
            <div className="text-center md:text-right">
              <a href="mailto:hugh@burkeroadpharmacy.com.au" className="text-[#94a3b8] hover:text-[#2dd4bf] transition-colors text-sm">
                hugh@burkeroadpharmacy.com.au
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-center gap-4 text-[#475569] text-xs">
            <span>© 2026 ChemistCare PrescriberOS</span>
            <span>Designed to support AHPRA & TGA compliance</span>
            <span>Privacy Act aligned</span>
            <span>Victorian SPA compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
