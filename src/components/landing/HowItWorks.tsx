import { motion } from "framer-motion";
import { FileJson, Globe, Package, Download, ArrowRight, Github, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: FileJson,
    title: "Parse Manifest",
    description: "We read the .mrpack file directly in your browser to extract the mod list and overrides.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  {
    icon: Globe,
    title: "Fetch Resources",
    description: "Your browser downloads the required mod files directly from Modrinth's secure CDN.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Package,
    title: "Bundle ZIP",
    description: "We organize mods, configs, and overrides into a standard ZIP structure compatible with launchers.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Download,
    title: "Instant Download",
    description: "The final ZIP is generated locally and served to you as a blob. No server uploads ever.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HowItWorks() {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold tracking-tight">
            How It Works
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg">
            Entirely client-side magic. Your data never leaves your device.
          </motion.p>
        </div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

          {steps.map((step, index) => (
            <motion.div key={index} variants={item} whileHover={{ y: -5 }} className="relative group">
              <div className={`bg-card border ${step.borderColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center text-center`}>
                <div className={`w-16 h-16 rounded-2xl ${step.bgColor} ${step.color} flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/20">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-20 flex flex-wrap justify-center gap-4">
          <a href="https://github.com/NezordMC/mrpack-converter" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="gap-2 h-12 px-6">
              <Github className="w-5 h-5" />
              View on GitHub
            </Button>
          </a>
          <a href="https://github.com/NezordMC/mrpack-converter/issues/new" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg" className="gap-2 h-12 px-6">
              <MessageSquarePlus className="w-5 h-5" />
              Request Feature
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
