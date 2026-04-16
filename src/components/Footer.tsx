import { MessageCircle } from "lucide-react";

const WHATSAPP_JVA = "https://wa.me/5515997332343";

const Footer = () => {
  return (
    <footer>
      {/* Main footer */}
      <div className="py-12 bg-muted border-t border-border text-muted-foreground">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="text-2xl font-black text-foreground mb-2">
                Neto Pedreiro
              </div>
              <p className="text-sm">Acabamento Fino & Porcelanatos</p>
            </div>
            <div className="flex justify-center gap-8">
              <a href="#servicos" className="hover:text-foreground transition-colors text-sm">
                Serviços
              </a>
              <a href="#depoimentos" className="hover:text-foreground transition-colors text-sm">
                Depoimentos
              </a>
              <a href="#contato" className="hover:text-foreground transition-colors text-sm">
                Contato
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Neto Pedreiro.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Developer credit bar */}
      <div className="bg-hero py-5 border-t border-hero-muted/20">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-hero-foreground text-sm tracking-wide">
          <span className="font-semibold">
            Criado por <strong className="font-black text-accent">JVA Sistemas</strong>
          </span>
          <span className="hidden sm:inline text-hero-muted">—</span>
          <span className="text-hero-muted font-medium">Todos os Direitos Reservados</span>
          <span className="hidden sm:inline text-hero-muted">—</span>
          <a
            href={WHATSAPP_JVA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold hover:text-accent transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            (15) 99733-2343
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
