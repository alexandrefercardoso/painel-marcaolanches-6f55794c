const Footer = () => {
  return (
    <footer className="py-12 bg-hero border-t border-hero-muted/20 text-hero-muted">
      <div className="container mx-auto px-6 text-center">
        <div className="text-2xl font-black text-accent mb-4">
          Neto Pedreiro
        </div>
        <p className="mb-6">Construção e Reforma de Qualidade</p>
        <div className="flex justify-center gap-8 mb-8">
          <a href="#servicos" className="hover:text-hero-foreground transition-colors">
            Serviços
          </a>
          <a href="#contato" className="hover:text-hero-foreground transition-colors">
            Contato
          </a>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Neto Pedreiro. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
