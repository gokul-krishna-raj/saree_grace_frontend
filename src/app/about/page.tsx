import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Saree Grace sources handloom sarees directly from weaver families in Elampillai, Tamil Nadu — authentic cotton and silk sarees, woven the traditional way.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="font-heading text-maroon-900 text-3xl">Our Story</h1>

      <p className="text-maroon-700 leading-relaxed">
        Saree Grace began with a simple idea: bring genuine Elampillai handloom sarees to shoppers
        who want to know exactly where their saree came from, and who wove it — without the saree
        passing through layer after layer of middlemen before it reaches you.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Elampillai, Tamil Nadu</h2>
      <p className="text-maroon-700 leading-relaxed">
        Elampillai is a small town in Tamil Nadu&apos;s Salem district with a long-standing handloom
        weaving tradition. Generations of weaver families here have specialized in cotton and silk
        sarees woven on traditional handlooms — a slower, more skilled process than mill-made
        weaving, and one that supports local livelihoods directly.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">What handloom actually means</h2>
      <p className="text-maroon-700 leading-relaxed">
        A handloom saree is woven by hand on a loom, thread by thread, rather than by an automated
        power loom. That means every piece has small, natural variations in weave and colour — a
        hallmark of genuine handcraft, not a manufacturing defect. It also means weaving a single
        saree can take anywhere from a day to over a week, depending on the complexity of the border
        and pattern.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">How we work</h2>
      <p className="text-maroon-700 leading-relaxed">
        We work directly with weaver families in and around Elampillai to bring their cotton and
        silk sarees to your wardrobe — for everyday wear, festive occasions, or as a gift. Every
        product listing on Saree Grace notes whether a piece is handloom, along with its fabric and
        care details, so you always know what you&apos;re buying.
      </p>
    </main>
  );
}
