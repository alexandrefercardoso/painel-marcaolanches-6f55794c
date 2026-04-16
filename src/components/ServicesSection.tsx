import { Gem, Scissors, Paintbrush } from "lucide-react";

const services = [
  {
    icon: Gem,
    title: "Assentamento de Porcelanatos",
    description:
      "Colocação de pisos e revestimentos com precisão milimétrica, cortes 45° perfeitos e acabamento impecável.",
  },
  {
    icon: Scissors,
    title: "Revestimentos de Alto Padrão",
    description:
      "Aplicação de pastilhas, mármore, granito e revestimentos 3D com técnica refinada e alinhamento perfeito.",
  },
  {
    icon: Paintbrush,
    title: "Massa Corrida e Pintura",
    description:
      "Acabamento em gesso, massa corrida lisa e pintura profissional para ambientes sofisticados.",
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
            Acabamento fino com precisão, estética e valorização do seu imóvel.
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
