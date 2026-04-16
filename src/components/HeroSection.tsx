import { useState, useEffect, useCallback } from "react";
import heroImage1 from "@/assets/hero-construction.jpg";
import heroImage2 from "@/assets/hero-2.jpg";
import heroImage3 from "@/assets/hero-3.jpg";
import heroImage4 from "@/assets/hero-4.jpg";

const images = [
  { src: heroImage1, alt: "Pedreiro assentando porcelanato com precisão" },
  { src: heroImage2, alt: "Profissional alinhando porcelanato no piso" },
  { src: heroImage3, alt: "Banheiro de luxo com porcelanato mármore" },
  { src: heroImage4, alt: "Sala com piso de porcelanato polido e acabamento fino" },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), []);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="relative bg-hero text-hero-foreground overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-accent rounded-full text-sm font-semibold mb-6 tracking-wide uppercase">
              Acabamento Fino & Porcelanatos
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Precisão em cada{" "}
              <span className="text-accent">detalhe</span>
            </h1>
            <p className="text-lg text-hero-muted mb-10 max-w-lg mx-auto lg:mx-0">
              Especialista em assentamento de porcelanatos, cortes 45°,
              revestimentos, massa corrida e pintura. Valorizamos seu imóvel com
              acabamento impecável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#servicos"
                className="px-8 py-4 bg-accent text-accent-foreground font-bold rounded-lg shadow-lg hover:brightness-110 transition-all duration-300"
              >
                Ver Serviços
              </a>
              <a
                href="#contato"
                className="px-8 py-4 border-2 border-accent text-accent font-bold rounded-lg hover:bg-accent/10 transition-all duration-300"
              >
                Solicitar Orçamento
              </a>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-hero-muted/20 relative aspect-video">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  width={1280}
                  height={720}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              {/* Navigation arrows */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm text-foreground rounded-full w-10 h-10 flex items-center justify-center hover:bg-background/80 transition-colors"
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm text-foreground rounded-full w-10 h-10 flex items-center justify-center hover:bg-background/80 transition-colors"
                aria-label="Próxima foto"
              >
                ›
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === current ? "bg-accent w-6" : "bg-background/60"
                    }`}
                    aria-label={`Foto ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 shadow-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  10+
                </div>
                <div>
                  <p className="font-bold text-card-foreground text-sm">Anos de</p>
                  <p className="text-muted-foreground text-xs">Experiência</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
