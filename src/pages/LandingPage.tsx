import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, FileCheck, TrendingUp, Check, Menu, X,
  Lock, Server, Eye, ClipboardList, ChevronDown, ChevronUp,
  Stethoscope, BarChart3, Zap, ExternalLink, Play, ArrowRight,
  BookOpen, Pill, Globe, HeartPulse, Users, Clock, CheckCircle2,
  Sparkles, Shield, Activity, BadgeCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoImg from "@/assets/chemistcare-logo.png";

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Section wrapper with fade-in ── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section id={id} ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: "easeOut" }} className={className}>
      {children}
    </motion.section>
  );
}

/* ── FAQ Accordion ── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#e8e0d4]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="text-[#1a1a2e] font-semibold text-lg pr-4" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>{q}</span>
        <ChevronDown size={20} className={`text-[#2F8F9D] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <p className="text-[#475569] text-base leading-relaxed pb-6">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Data ── */
const howItWorksSteps = [
  {
    num: "01",
    title: "Patient books online",
    desc: "Patients select a prescribing service through your branded booking portal. Intake forms, eligibility checks, and consent are auto-collected before arrival.",
    icon: BookOpen,
  },
  {
    num: "02",
    title: "Pre-consult snapshot",
    desc: "Review allergy alerts, dispense history, eligibility flags, and GP contact status — everything you need before the consult begins.",
    icon: ClipboardList,
  },
  {
    num: "03",
    title: "Guided prescribing workflow",
    desc: "Follow protocol step-by-step with real-time decision support, red-flag prompts, and auto-drafted clinical notes as you consult.",
    icon: Stethoscope,
  },
  {
    num: "04",
    title: "Post-consult in 60 seconds",
    desc: "eScript generated, GP letter drafted, billing recorded, follow-up scheduled — complete with audit-ready documentation.",
    icon: CheckCircle2,
  },
];

const faqs = [
  { q: "How long does setup take?", a: "Most pharmacies are live within 48 hours. We handle onboarding, protocol configuration, and staff training remotely — no IT team required." },
  { q: "How does ChemistCare handle data security?", a: "All data is hosted on Australian-based infrastructure with AES-256 encryption at rest and TLS 1.3 in transit. We implement role-based access controls, full audit trails, and configurable data retention policies." },
  { q: "Does it integrate with existing dispensing systems?", a: "ChemistCare PrescriberOS complements your existing POS/dispensing system. We provide structured exports and are actively developing direct integrations with major Australian pharmacy platforms." },
  { q: "What does it cost?", a: "We offer transparent per-pharmacy pricing with no lock-in contracts. Early access partners receive founding-member rates. Contact us to discuss your specific needs." },
  { q: "Is this aligned with AHPRA and TGA requirements?", a: "Yes. ChemistCare PrescriberOS supports compliance with AHPRA professional standards and TGA requirements for pharmacist prescribing under Structured Prescribing Arrangements. Our protocols are reviewed by practising pharmacist prescribers." },
];

const roles = [
  { value: "", label: "Select your role" },
  { value: "intern", label: "Pharmacy Intern" },
  { value: "pharmacist", label: "Registered Pharmacist" },
  { value: "prescriber", label: "Pharmacist Prescriber" },
  { value: "owner", label: "Pharmacy Owner / Manager" },
  { value: "other", label: "Other" },
];

/* ── Waitlist Form ── */
function WaitlistForm({ variant = "light" }: { variant?: "light" | "dark" }) {
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2F8F9D]/10 mb-4">
          <Check size={32} className="text-[#2F8F9D]" />
        </div>
        <h3 className="text-2xl font-bold text-[#1a1a2e] mb-2" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>You're on the list!</h3>
        <p className="text-[#475569]">We'll be in touch shortly with early access details.</p>
      </div>
    );
  }

  const isDark = variant === "dark";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@pharmacy.com.au" required
        className={`w-full rounded-xl px-5 py-4 border outline-none text-base transition-colors ${isDark ? "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#2F8F9D]" : "bg-white border-[#e8e0d4] text-[#1a1a2e] placeholder:text-[#94a3b8] focus:border-[#2F8F9D] shadow-sm"}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={role} onChange={e => setRole(e.target.value)}
          className={`rounded-xl px-5 py-4 border outline-none text-base transition-colors appearance-none ${isDark ? "bg-white/10 border-white/20 text-white focus:border-[#2F8F9D]" : "bg-white border-[#e8e0d4] text-[#1a1a2e] focus:border-[#2F8F9D] shadow-sm"}`}>
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <input type="text" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} placeholder="Pharmacy name (optional)"
          className={`rounded-xl px-5 py-4 border outline-none text-base transition-colors ${isDark ? "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#2F8F9D]" : "bg-white border-[#e8e0d4] text-[#1a1a2e] placeholder:text-[#94a3b8] focus:border-[#2F8F9D] shadow-sm"}`} />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-[#2F8F9D] hover:bg-[#1E5E66] text-white font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 text-base shadow-lg shadow-[#2F8F9D]/20">
        {loading ? "Joining..." : "Join the Waitlist"}
      </button>
    </form>
  );
}

/* ── Logo Ticker (Heidi-style) ── */
function LogoTicker() {
  const partners = [
    "Vic Health", "PSA", "AHPRA", "TGA", "PBS", "Guild"
  ];
  return (
    <div className="overflow-hidden py-8">
      <div className="flex animate-[scroll_20s_linear_infinite] gap-16 items-center">
        {[...partners, ...partners].map((name, i) => (
          <div key={i} className="shrink-0 text-[#94a3b8]/60 text-sm font-semibold tracking-widest uppercase whitespace-nowrap">
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a2e]" style={{ fontFamily: "'Inter', system-ui, sans-serif", scrollBehavior: "smooth" }}>

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#faf8f5]/95 backdrop-blur-xl shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="ChemistCare" className="h-10 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#475569] hover:text-[#1a1a2e] text-sm font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-[#475569] hover:text-[#1a1a2e] text-sm font-medium transition-colors">How It Works</a>
            <a href="#security" className="text-[#475569] hover:text-[#1a1a2e] text-sm font-medium transition-colors">Security</a>
            <a href="#faq" className="text-[#475569] hover:text-[#1a1a2e] text-sm font-medium transition-colors">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")}
              className="text-[#475569] hover:text-[#1a1a2e] text-sm font-medium transition-colors px-4 py-2">
              Log in
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="bg-[#2F8F9D] hover:bg-[#1E5E66] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all shadow-sm">
              Start Prescribing Now
            </button>
          </div>
          <button className="md:hidden text-[#1a1a2e]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#faf8f5] border-t border-[#e8e0d4] px-6 py-4 flex flex-col gap-3">
              <a href="#features" className="text-[#475569] text-sm py-2" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-[#475569] text-sm py-2" onClick={() => setMenuOpen(false)}>How It Works</a>
              <a href="#security" className="text-[#475569] text-sm py-2" onClick={() => setMenuOpen(false)}>Security</a>
              <a href="#faq" className="text-[#475569] text-sm py-2" onClick={() => setMenuOpen(false)}>FAQ</a>
              <button onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                className="bg-[#2F8F9D] text-white font-semibold text-sm px-5 py-3 rounded-lg w-full mt-2">Start Prescribing Now</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center pt-[72px]">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2F8F9D]/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E6F4F4]/60 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-[#E6F4F4] text-[#2F8F9D] text-sm font-medium px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2F8F9D] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#2F8F9D]" /></span>
              Now Available in Victoria · Early Access 2026
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight text-[#1a1a2e] mb-8"
              style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              Your partner for full scope pharmacy prescribing
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl md:text-2xl text-[#475569] max-w-2xl mb-10 leading-relaxed">
              Protocol-driven prescribing, automated documentation, and practice-ready workflows — so you prescribe confidently, not just compliantly.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-start gap-4">
              <button onClick={() => navigate("/dashboard")}
                className="bg-[#2F8F9D] hover:bg-[#1E5E66] text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-[#2F8F9D]/20 flex items-center gap-2">
                Start Prescribing Now <ArrowRight size={20} />
              </button>
              <button onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
                className="border-2 border-[#2F8F9D] text-[#2F8F9D] bg-transparent px-8 py-4 text-lg font-semibold rounded-xl hover:bg-[#2F8F9D]/5 transition-all duration-300">
                Join the Waitlist
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES BAR ─── */}
      <div className="border-y border-[#e8e0d4] bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              { icon: ShieldCheck, label: "AHPRA Aligned" },
              { icon: Lock, label: "AES-256 Encrypted" },
              { icon: Server, label: "Australian Data Residency" },
              { icon: FileCheck, label: "Privacy Act Compliant" },
              { icon: BadgeCheck, label: "Victorian SPA Compatible" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2 text-[#475569] text-sm">
                <b.icon size={16} className="text-[#2F8F9D]" />
                <span className="font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── STATS STRIP (Heidi-style "Real world impact") ─── */}
      <Section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2F8F9D] text-sm font-semibold tracking-wider uppercase mb-4">Real-World Impact</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              Pharmacist prescribing is already transforming healthcare
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { target: 62000, suffix: "+", label: "Services across 800+ VIC pharmacies", source: "Vic Health", href: "https://www.health.vic.gov.au/news/chemist-care-now-is-expanding-to-treat-more-conditions" },
              { target: 23000, suffix: "+", label: "Pilot services — zero serious safety concerns", source: "Vic Pilot Summary", href: "https://www.health.vic.gov.au/publications/victorian-community-pharmacist-statewide-pilot-summary-report" },
              { target: 12000, suffix: "+", label: "NSW trial consultations milestone", source: "NSW Health", href: "https://www.health.nsw.gov.au/news/Pages/20240305_00.aspx" },
              { target: 18, suffix: "", label: "National Scope of Practice recommendations", source: "Australian Government", href: "https://www.health.gov.au/our-work/scope-of-practice-review" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <p className="text-5xl md:text-6xl font-bold text-[#1a1a2e] tabular-nums mb-3" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </p>
                <p className="text-[#475569] text-base leading-snug mb-3">{s.label}</p>
                <a href={s.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#2F8F9D] text-sm font-medium hover:underline">
                  {s.source} <ExternalLink size={12} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── PROBLEM / SOLUTION SECTION (Heidi-style "A care partner for the full clinical day") ─── */}
      <Section className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] leading-[1.1] mb-6" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
                Unseen admin destroys clinical capacity
              </h2>
              <p className="text-lg text-[#475569] leading-relaxed mb-8">
                Australian pharmacist prescribers spend more time on paperwork than patients. Documentation, compliance checks, GP letters, billing — it all adds up. ChemistCare PrescriberOS gives you that time back.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Clock, text: "Cut post-consult admin by up to 50%" },
                  { icon: Shield, text: "Protocol-guided workflows reduce clinical risk" },
                  { icon: TrendingUp, text: "Track revenue, volume, and outcomes in real time" },
                  { icon: Users, text: "Built specifically for Australian pharmacist prescribers" },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-[#E6F4F4] flex items-center justify-center">
                      <item.icon size={20} className="text-[#2F8F9D]" />
                    </div>
                    <p className="text-[#1a1a2e] text-base font-medium pt-2">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#E6F4F4] to-[#f0fafa] rounded-3xl p-10 md:p-14">
                <div className="space-y-6">
                  {[
                    { metric: "12", label: "Consults Today", color: "#2F8F9D" },
                    { metric: "$1,840", label: "Revenue Generated", color: "#1FA971" },
                    { metric: "3", label: "GP Referrals Sent", color: "#3B82F6" },
                    { metric: "5", label: "Follow-ups Scheduled", color: "#F6D860" },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between bg-white rounded-xl px-6 py-4 shadow-sm">
                      <span className="text-[#475569] text-sm font-medium">{m.label}</span>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: m.color }}>{m.metric}</span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[#94a3b8] text-xs mt-6">Simulated dashboard · Updated in real time when live</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── FEATURES (Heidi-style product cards) ─── */}
      <Section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2F8F9D] text-sm font-semibold tracking-wider uppercase mb-4">Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-4" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              Your clinical command centre
            </h2>
            <p className="text-lg text-[#475569] max-w-xl mx-auto">Everything you need for safe, efficient prescribing — in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Stethoscope, title: "Protocol-Driven Prescribing", body: "Victoria-approved clinical playbooks for UTI, shingles, OCP, skin conditions, and more. Instant eligibility screening, red-flag alerts, and real-time decision support.", color: "#2F8F9D" },
              { icon: FileCheck, title: "One-Click Documentation", body: "Auto-generated SOAP notes, GP referral letters, and audit-ready logs. Reduce post-consult admin by up to 50% with structured, compliant records.", color: "#1FA971" },
              { icon: BarChart3, title: "Practice Growth Engine", body: "Smart patient intake, real-time revenue dashboards, automated follow-ups, and configurable service menus. Turn your credential into a business asset.", color: "#3B82F6" },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="bg-white rounded-2xl p-8 border border-[#e8e0d4] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${f.color}10` }}>
                  <f.icon size={28} style={{ color: f.color }} />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a2e] mb-3" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>{f.title}</h3>
                <p className="text-[#475569] leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── HOW IT WORKS (Heidi "How it works" style — step-by-step with vertical line) ─── */}
      <Section id="how-it-works" className="py-24 md:py-32 px-6 bg-[#E6F4F4]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#2F8F9D] text-sm font-semibold tracking-wider uppercase mb-4">How It Works</p>
            <h2 className="text-4xl md:text-[3.5rem] font-bold text-[#1a1a2e] mb-4" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              From booking to billing, streamlined
            </h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto">From the first click to the final note, ChemistCare is fast, secure, and designed around how you care.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {howItWorksSteps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative flex gap-8 pb-16 last:pb-0">
                {/* Vertical line */}
                {i < howItWorksSteps.length - 1 && (
                  <div className="absolute left-7 top-16 bottom-0 w-px bg-[#2F8F9D]/20" />
                )}
                {/* Step number circle */}
                <div className="shrink-0 w-14 h-14 rounded-full bg-[#2F8F9D] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#2F8F9D]/20 relative z-10">
                  {step.num}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1a1a2e] mb-2" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>{step.title}</h3>
                  <p className="text-[#475569] text-base leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button onClick={() => navigate("/dashboard")}
              className="bg-[#2F8F9D] hover:bg-[#1E5E66] text-white px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-[#2F8F9D]/20 inline-flex items-center gap-2">
              See it in action <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Section>

      {/* ─── SECURITY & COMPLIANCE (Heidi "Your duty of care, built in" style) ─── */}
      <Section id="security" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2F8F9D] text-sm font-semibold tracking-wider uppercase mb-4">Security & Privacy</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-4" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              Your duty of care, built in
            </h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto">We hold ourselves to the highest standard there is: the one you set when you care for patients.</p>
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {["Privacy Act", "AHPRA Standards", "TGA Compliant", "APPs Aligned", "AES-256"].map(badge => (
              <div key={badge} className="bg-[#faf8f5] border border-[#e8e0d4] rounded-lg px-5 py-3 text-sm font-medium text-[#475569]">
                {badge}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Server, title: "Australian Data Residency", desc: "All patient and clinical data hosted on Australian-based infrastructure." },
              { icon: Lock, title: "Encryption at Rest & Transit", desc: "AES-256 encryption for stored data, TLS 1.3 for all data in transit." },
              { icon: Eye, title: "Role-Based Access Controls", desc: "Granular permissions ensuring staff only access data relevant to their role." },
              { icon: ClipboardList, title: "Audit Trails & Retention", desc: "Comprehensive activity logging with configurable data retention policies." },
            ].map((sf, i) => (
              <motion.div key={sf.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[#faf8f5] border border-[#e8e0d4] rounded-2xl p-8 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#E6F4F4] flex items-center justify-center mx-auto mb-5">
                  <sf.icon size={24} className="text-[#2F8F9D]" />
                </div>
                <h3 className="font-bold text-[#1a1a2e] mb-2" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>{sf.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{sf.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── SOCIAL PROOF / TESTIMONIALS ─── */}
      <Section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2F8F9D] text-sm font-semibold tracking-wider uppercase mb-4">Early Feedback</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              What early partners say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { quote: "This gave me the clinical structure I needed after completing my prescriber training. Consultations are now half the time with zero second-guessing.", author: "Pharmacist Prescriber", location: "Burke Road Pharmacy, Melbourne" },
              { quote: "Protocol playbooks, billing, documentation — all in one screen. We scaled our prescribing service in the first month. Nothing else comes close for pharmacy.", author: "Pharmacy Owner", location: "Community Pharmacy, Victoria" },
            ].map(t => (
              <div key={t.location} className="bg-white rounded-2xl p-8 md:p-10 border border-[#e8e0d4] shadow-sm">
                <div className="text-[#2F8F9D] mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
                </div>
                <p className="text-[#1a1a2e] leading-relaxed text-lg mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="text-[#1a1a2e] font-semibold">{t.author}</p>
                  <p className="text-[#94a3b8] text-sm">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── POLICY MOMENTUM / MEDIA ─── */}
      <Section className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2F8F9D] text-sm font-semibold tracking-wider uppercase mb-4">In the Media</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              Policy momentum is building
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Chemist Care Now Expanding", summary: "Victoria is expanding its pharmacist prescribing program to treat more conditions across 800+ pharmacies.", href: "https://www.health.vic.gov.au/news/chemist-care-now-is-expanding-to-treat-more-conditions" },
              { title: "VIC Pilot Summary Report", summary: "23,000+ services delivered safely in the first 12 months with no serious safety concerns reported.", href: "https://www.health.vic.gov.au/publications/victorian-community-pharmacist-statewide-pilot-summary-report" },
              { title: "Community Pharmacist Program", summary: "Victoria's program continues to expand access to healthcare across the state.", href: "https://www.health.vic.gov.au/primary-care/community-pharmacist-program" },
              { title: "National Scope of Practice Review", summary: "18 recommendations from the Australian Government to expand pharmacist scope of practice nationally.", href: "https://www.health.gov.au/our-work/scope-of-practice-review" },
              { title: "NSW Trial Hits 12,000 Consults", summary: "NSW pharmacist prescribing pilot reaches a major milestone with 12,000+ patient consultations.", href: "https://www.health.nsw.gov.au/news/Pages/20240305_00.aspx" },
              { title: "Queensland Pharmacist Prescribing", summary: "Queensland announces expanded scope of practice for pharmacists to improve community healthcare.", href: "https://statements.qld.gov.au/statements/102216" },
            ].map((item, i) => (
              <motion.a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-[#faf8f5] border border-[#e8e0d4] rounded-2xl p-6 hover:border-[#2F8F9D]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 block">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2 group-hover:text-[#2F8F9D] transition-colors" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>{item.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed mb-4">{item.summary}</p>
                <span className="inline-flex items-center gap-1.5 text-[#2F8F9D] text-sm font-medium">
                  Read more <ExternalLink size={12} />
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── VIDEO GALLERY ─── */}
      <Section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2F8F9D] text-sm font-semibold tracking-wider uppercase mb-4">See the Buzz</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              Stay present in the moments that matter
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "https://www.youtube.com/embed/bN94eaY-QDE",
              "https://www.youtube.com/embed/XnFnxe5y0_k",
              "https://www.youtube.com/embed/GbVFtOOmEQ4",
            ].map((url, i) => (
              <motion.div key={url} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden border border-[#e8e0d4] bg-white shadow-sm">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe src={url} title={`Video ${i + 1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                    className="absolute inset-0 w-full h-full" loading="lazy" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── FAQ (Heidi style — clean, minimal) ─── */}
      <Section id="faq" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2F8F9D] text-sm font-semibold tracking-wider uppercase mb-4">Common Questions</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              Frequently asked questions
            </h2>
          </div>
          <div>
            {faqs.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </Section>

      {/* ─── FINAL CTA / WAITLIST ─── */}
      <Section id="waitlist" className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1E5E66] to-[#2F8F9D] rounded-3xl p-10 md:p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Recoleta', 'Manrope', serif" }}>
              Ready for your next consult?
            </h2>
            <p className="text-white/80 text-lg mt-4 max-w-xl mx-auto mb-10">
              Join the waitlist and be among the first to experience ChemistCare PrescriberOS when we launch.
            </p>
            <WaitlistForm variant="dark" />
            <p className="text-white/40 text-sm mt-6">No spam · Instant confirmation · Founding partner rates</p>
          </div>
        </div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#e8e0d4] bg-[#faf8f5] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <img src={logoImg} alt="ChemistCare" className="h-10 w-auto mb-4" />
              <p className="text-[#475569] text-sm max-w-sm leading-relaxed">
                Clinical workflow software for pharmacist prescribers. Built in Australia, designed for the full scope of pharmacy practice.
              </p>
            </div>
            <div>
              <h4 className="text-[#1a1a2e] font-semibold text-sm mb-4">Platform</h4>
              <div className="space-y-3">
                <a href="#features" className="block text-[#475569] text-sm hover:text-[#2F8F9D] transition-colors">Features</a>
                <a href="#how-it-works" className="block text-[#475569] text-sm hover:text-[#2F8F9D] transition-colors">How It Works</a>
                <a href="#security" className="block text-[#475569] text-sm hover:text-[#2F8F9D] transition-colors">Security</a>
                <a href="#faq" className="block text-[#475569] text-sm hover:text-[#2F8F9D] transition-colors">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="text-[#1a1a2e] font-semibold text-sm mb-4">Contact</h4>
              <div className="space-y-3">
                <a href="mailto:hugh@burkeroadpharmacy.com.au" className="block text-[#475569] text-sm hover:text-[#2F8F9D] transition-colors">
                  hugh@burkeroadpharmacy.com.au
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#e8e0d4] flex flex-wrap justify-between items-center gap-4 text-[#94a3b8] text-xs">
            <span>© 2026 ChemistCare PrescriberOS. All rights reserved.</span>
            <div className="flex flex-wrap gap-4">
              <span>Designed to support AHPRA & TGA compliance</span>
              <span>Privacy Act aligned</span>
              <span>Victorian SPA compatible</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
