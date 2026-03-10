import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is XViralLabs?",
    a: "XViralLabs is an AI-powered platform that reverse-engineers why tweets go viral. It analyzes psychology, hooks, patterns, and platform mechanics — then helps you create your own high-performing content.",
  },
  {
    q: "How does the analysis work?",
    a: "Paste any tweet into the analyzer. Our AI breaks it down across 10 modes — from viral diagnosis and psychology deconstruction to pattern extraction and engagement forecasting.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. Free accounts get 5 analyses per day. Upgrade to Pro for unlimited analyses, saved patterns, and the full Content Lab suite.",
  },
  {
    q: "What is the Content Lab?",
    a: "Content Lab is your personal content workspace. It includes a content calendar, brand pillars, mind maps, idea banks, and a tweet drafting workspace — all powered by AI.",
  },
  {
    q: "Can I generate content, not just analyze?",
    a: "Absolutely. Use Mode 4 to generate 20+ viral variations, Mode 8 for idea generation, or the Content Lab to plan and draft entire content calendars.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your analyses, patterns, and content are private to your account. We do not share or sell your data.",
  },
];

export function FAQ() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-4">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-[15px] font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
