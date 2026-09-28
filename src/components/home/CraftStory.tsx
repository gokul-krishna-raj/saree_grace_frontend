import Image from "next/image";
import Link from "next/link";

// Brand story: why Saree Grace is different, told once, with one strong photograph.
export function CraftStory() {
  return (
    <section aria-labelledby="craft-story" className="bg-cream section-y">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md lg:aspect-[5/4]">
          <Image
            src="/images/hero/slide_2.webp"
            alt="A weaver working at a traditional wooden handloom in Elampillai"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[35%_center]"
          />
        </div>
        <div className="max-w-xl">
          <p className="eyebrow mb-4">Our story</p>
          <h2 id="craft-story" className="text-heading-xl text-foreground">
            Woven in Elampillai, one thread at a time
          </h2>
          <div className="text-muted-foreground mt-6 space-y-4 text-[15px] leading-relaxed sm:text-base">
            <p>
              Elampillai, a small town in Tamil Nadu&apos;s Salem district, has been a centre of
              weaving for generations. We work directly with local weaver families to bring their
              cotton and silk sarees to your wardrobe — without layers of middlemen along the way.
            </p>
            <p>
              Every piece carries small, natural variations that come from being made by hand.
              That&apos;s not a flaw — it&apos;s the craft.
            </p>
          </div>
          <Link
            href="/about"
            className="text-foreground mt-8 inline-flex items-center gap-2 text-sm font-medium"
          >
            <span className="link-underline">Read our story</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
