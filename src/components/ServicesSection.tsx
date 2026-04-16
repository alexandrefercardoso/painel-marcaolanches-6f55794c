import { Home, Zap, Wrench } from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Acabamento fino, porcelanatos",
    description:
      "Aplicação de porcelanatos, revestimentos finos e acabamentos de alta precisão para ambientes sofisticados.",
  },
  {
    icon: Zap,
    title: "Reformas Modernas",
    description:
      "Atualize seu espaço com reformas inteligentes e esteticamente agradáveis. Design e funcionalidade unidos.",
  },
  {
    icon: Wrench,
    title: "Instalações",
    description:
      "Pisos, revestimentos, esquadrias e outros materiais instalados com acabamento de alta precisão.",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-foreground mb-4">
            Nossos Serviços
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluções completas para sua obra, do planejamento à execução.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-background p-8 rounded-xl shadow-md border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
                <service.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
