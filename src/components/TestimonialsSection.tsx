const testimonials = [
  {
    initials: "MR",
    name: "Mariana Ribeiro",
    role: "Empresária",
    text: "A Neto Pedreiro superou todas as minhas expectativas! A obra foi entregue no prazo e com um nível de detalhe impressionante. Recomendo de olhos fechados!",
  },
  {
    initials: "JL",
    name: "João Lucas",
    role: "Arquiteto",
    text: "A precisão e a organização do Neto Pedreiro são notáveis. Um profissional que entende de projeto e entrega resultados de excelência em cada etapa.",
  },
  {
    initials: "AS",
    name: "Ana Silva",
    role: "Designer de Interiores",
    text: "Trabalhar com o Neto Pedreiro é sinônimo de tranquilidade. A comunicação é clara e a execução é impecável.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-hero text-hero-foreground">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-hero-muted max-w-2xl mx-auto">
            Veja como nossos projetos impactaram positivamente quem confiou em
            nosso trabalho.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-foreground/5 backdrop-blur-sm p-8 rounded-xl border border-hero-muted/20"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-lg">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-hero-foreground">{t.name}</p>
                  <p className="text-hero-muted text-sm">{t.role}</p>
                </div>
              </div>
              <p className="text-hero-muted leading-relaxed italic">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
