import heroImage from "@/assets/hero-construction.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-hero text-hero-foreground overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-accent rounded-full text-sm font-semibold mb-6">
              Construção & Reforma
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Construindo Sonhos,{" "}
              <span className="text-accent">Entregando Qualidade</span>
            </h1>
            <p className="text-lg text-hero-muted mb-10 max-w-lg mx-auto lg:mx-0">
              Transformamos seus projetos em realidade com precisão, eficiência e
              um toque moderno. Da fundação ao acabamento.
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
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-hero-muted/20">
              <img
                src={heroImage}
                alt="Pedreiro profissional trabalhando em obra"
                width={1280}
                height={720}
                className="w-full h-auto object-cover"
              />
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
