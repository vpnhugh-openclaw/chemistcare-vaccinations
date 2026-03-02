import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, FileCheck, TrendingUp, Star, Check } from "lucide-react";

function Section({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

function StepCard({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="relative bg-white rounded-3xl p-6 shadow-md border border-[#f1f5f9] text-left">
      <span className="absolute top-4 right-4 text-5xl font-black text-[#dbeafe] select-none">{num}</span>
      <h3 className="text-lg font-bold text-[#111827] mb-2 pr-12">{title}</h3>
      <p className="text-sm text-[#64748b] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, iconColor, iconBg, title, body, delay }: {
  icon: React.ElementType; iconColor: string; iconBg: string; title: string; body: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-white/60 backdrop-blur-xl border border-white/30 shadow-xl rounded-3xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
    >
      <div className={`${iconBg} rounded-2xl p-3 inline-flex mb-5`}>
        <Icon size={40} color={iconColor} />
      </div>
      <h3 className="text-2xl font-bold text-[#111827] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>{title}</h3>
      <p className="text-[#64748b] leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>{body}</p>
    </motion.div>
  );
}

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

const trustBadges = [
  "Victoria Chemist Care Now ready",
  "PBS & TGA aligned",
  "Built for new pharmacist prescribers",
  "Privacy Act compliant",
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "Inter, sans-serif", scrollBehavior: "smooth" }}>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse at top left, #f0f9ff 0%, #e0f2fe 100%)" }}>
        {/* subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-block rounded-full bg-[#dbeafe] text-[#1d4ed8] text-sm font-semibold px-4 py-1.5 mb-8">
            Now Available in Victoria • Chemist Care Now 2026
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6"
            style={{ fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #2563eb, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ChemistCare Prescriber&nbsp;OS
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl text-[#475569] font-medium mb-6">
            Your First-Day-Ready Operating System for Chemist Care Now
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-[#64748b] max-w-2xl mx-auto mb-10 leading-relaxed">
            From registrant overwhelm to prescriber-lead confidence. Structured protocols, one-click SOAP notes, Victoria-specific workflows, and built-in growth tools — so you prescribe safely, compliantly, and profitably from your very first consult.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300">
              Join Early Access Waitlist
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="border-2 border-[#93c5fd] text-[#1d4ed8] bg-white/80 backdrop-blur px-8 py-4 text-lg font-semibold rounded-2xl hover:bg-[#eff6ff] hover:-translate-y-1 transition-all duration-300">
              Start Prescribing Now
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-3">
            {trustBadges.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 bg-white/80 border border-[#e2e8f0] text-[#64748b] text-xs px-3 py-1.5 rounded-full">
                <Check size={12} className="text-[#10b981]" />{b}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <Section className="py-24 md:py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Clinical Command Centre — From Chaos to Confidence
          </h2>
          <p className="text-[#64748b] text-lg mb-16">Everything you need for safe, efficient, compliant prescribing — in one place.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard delay={0} icon={ShieldCheck} iconColor="#3b82f6" iconBg="bg-[#eff6ff]" title="Protocol-Driven Prescribing"
              body="Pre-built Victoria-approved clinical playbooks for UTI, shingles, OCP, skin conditions, school sores, and contraceptive resupply. Instant eligibility screening, red-flag alerts, and decision support — so every consult follows best practice." />
            <FeatureCard delay={0.1} icon={FileCheck} iconColor="#0ea5e9" iconBg="bg-[#ecfeff]" title="One-Click Documentation & Compliance"
              body="Auto-generated SOAP notes, safety flags, GP referral communications, and audit-ready consultation logs. Cut post-consult admin by up to 50% and stay fully compliant with every Chemist Care Now requirement." />
            <FeatureCard delay={0.2} icon={TrendingUp} iconColor="#10b981" iconBg="bg-[#ecfdf5]" title="Practice Growth & Revenue Tools"
              body="Embedded online booking, smart patient intake forms, configurable service menus and pricing grids, real-time revenue dashboard, and automated follow-up — turning your prescriber credential into a measurable business asset." />
          </div>
        </div>
      </Section>

      {/* ─── HOW IT WORKS ─── */}
      <Section className="py-24 md:py-32 px-4" style={{ background: "linear-gradient(to bottom right, #f8fafc, #eff6ff)" }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your First 15-Minute Chemist Care Now Consult — Streamlined
          </h2>
          <p className="text-[#64748b] text-lg mb-16">From booking to billing in four clean steps.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <StepCard key={s.num} num={s.num} title={s.title} desc={s.desc} delay={i * 0.1} />
            ))}
          </div>
          <div className="mt-12 inline-flex items-center gap-2 bg-[#2563eb] text-white rounded-full px-6 py-3 font-semibold text-sm">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]" /></span>
            UTI Consult — Step 3 of 4 · Sarah M. · Est. 4 min remaining
          </div>
        </div>
      </Section>

      {/* ─── DASHBOARD + SOCIAL PROOF ─── */}
      <Section className="py-24 md:py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Mock dashboard */}
          <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-[#2563eb] to-[#4338ca] p-10 shadow-2xl text-white mb-16">
            <p className="text-lg font-semibold text-[#93c5fd] mb-6">Today's Overview</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-5xl font-black">{m.value}</p>
                  <p className="text-sm text-[#93c5fd] font-medium mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 mt-8 pt-4 text-center">
              <p className="text-[#93c5fd] text-xs">Live dashboard • Victoria Chemist Care Now compliant</p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { quote: "This gave me the structure I didn't have after training. Consultations are now half the time with zero second-guessing. I finally feel like a prescriber, not a student.", author: "New Pharmacist Prescriber, Melbourne" },
              { quote: "Protocol playbooks, billing, documentation — all in one screen. I scaled my Chemist Care Now service in the first month. Nothing else comes close.", author: "Victorian Community Pharmacist Prescriber" },
            ].map((t) => (
              <div key={t.author} className="bg-white rounded-3xl p-8 shadow-lg border border-[#f1f5f9]">
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className="fill-[#facc15] text-[#facc15]" />)}</div>
                <span className="text-6xl text-[#dbeafe] font-serif leading-none select-none">"</span>
                <p className="text-[#334155] leading-relaxed -mt-4">{t.quote}</p>
                <p className="text-[#64748b] text-sm font-semibold mt-4">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── FINAL CTA ─── */}
      <Section className="py-24 md:py-32 px-4" style={{ background: "linear-gradient(to bottom right, #2563eb, #1d4ed8, #3730a3)" }}>
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Launch Your Prescriber-Led Service?
          </h2>
          <p className="text-xl text-[#93c5fd] mt-4 max-w-2xl mx-auto">
            Be among the first pharmacist prescribers in Victoria to experience the OS built exclusively for Chemist Care Now. Join the waitlist for early access, exclusive demo, and priority onboarding.
          </p>
          <div className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input type="email" placeholder="your@pharmacy.email"
              className="rounded-2xl px-5 py-4 text-[#0f172a] bg-white shadow-lg flex-1 outline-none" />
            <button className="bg-white text-[#1d4ed8] font-bold px-8 py-4 rounded-2xl shadow-lg hover:bg-[#eff6ff] hover:-translate-y-1 transition-all duration-300 whitespace-nowrap">
              Join Waitlist →
            </button>
          </div>
          <p className="text-[#93c5fd] text-sm mt-4">No spam • Instant confirmation • Early access perks for Victorian prescribers</p>
        </div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0f172a] py-12 px-4 text-center">
        <p className="text-white font-bold text-lg">ChemistCare Prescriber OS</p>
        <p className="text-[#94a3b8] text-sm mt-1">Built for pharmacist prescribers. Built in Australia.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-[#64748b] text-xs">
          <span>© 2026 ChemistCare Prescriber OS</span>
          <span>TGA/APRA compliant</span>
          <span>Privacy Act aligned</span>
          <span>Victoria Chemist Care Now & PBS ready</span>
          <a href="mailto:hello@chemistcareos.com" className="hover:text-[#60a5fa] transition-colors">hello@chemistcareos.com</a>
        </div>
      </footer>
    </div>
  );
}
