import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is XViralLabs?",
    a: "XViralLabs is a chat-based AI agent built specifically for Twitter/X growth. From a single conversation you can analyze viral tweets, generate posts in your voice, build sales campaigns, write threads, plan a daily feed and more.",
  },
  {
    q: "How does the chat work?",
    a: "Pick a tool from the floating suggestions (Analyze, Generate, Sales, Video, Thread, Rewrite, Daily Feed, Content OS, Content Lab), type what you want, and the agent runs that tool. Every chat is saved and filterable in the sidebar.",
  },
  {
    q: "Can I copy posts easily?",
    a: "Yes. When the AI generates multiple posts, each post gets its own copy button. One tap copies the post — ready to paste into X.",
  },
  {
    q: "Is it free?",
    a: "Yes — free accounts get a daily credit allowance. Each message in the chat costs one credit. Upgrade for higher limits.",
  },
  {
    q: "Where do I configure my voice and brand?",
    a: "Open Settings from the sidebar. Inside you'll find Memory (voice, niche, pillars), Sales Engine (your products), Growth (tracking) and Plans.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your chats, products, and saved data are private to your account. We do not share or sell your data.",
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
