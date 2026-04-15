const ContactSection = () => {
  return (
    <section id="contato" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-foreground mb-6">
              Pronto para Construir seu Futuro?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Entre em contato conosco hoje mesmo e solicite um orçamento sem
              compromisso. Estamos prontos para transformar sua visão em
              realidade.
            </p>
            <div className="flex flex-col gap-4 text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <span className="font-medium">(XX) XXXXX-XXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <span className="font-medium">contato@netopedreiro.com.br</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <span className="font-medium">Sua Cidade, Brasil</span>
              </div>
            </div>
          </div>
          <div className="bg-card p-8 lg:p-10 rounded-2xl shadow-xl border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              Fale Conosco
            </h3>
            <form className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome aqui"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  placeholder="(XX) XXXXX-XXXX"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  placeholder="Detalhe seu projeto aqui..."
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 bg-accent text-accent-foreground font-bold rounded-lg shadow-lg hover:brightness-110 transition-all duration-300"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
