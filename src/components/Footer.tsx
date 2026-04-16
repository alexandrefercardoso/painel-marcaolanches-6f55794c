import { MessageCircle } from "lucide-react";

const WHATSAPP_JVA = "https://wa.me/5515997332343";

const Footer = () => {
  return (
    <footer>
      {/* Main footer */}
      <div className="py-12 bg-hero border-t border-hero-muted/20 text-hero-muted">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="text-2xl font-black text-accent mb-2">
                Neto Pedreiro
              </div>
              <p className="text-sm">Acabamento Fino & Porcelanatos</p>
            </div>
            <div className="flex justify-center gap-8">
              <a href="#servicos" className="hover:text-hero-foreground transition-colors text-sm">
                Serviços
              </a>
              <a href="#depoimentos" className="hover:text-hero-foreground transition-colors text-sm">
                Depoimentos
              </a>
              <a href="#contato" className="hover:text-hero-foreground transition-colors text-sm">
                Contato
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Neto Pedreiro. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Developer credit bar */}
      <div className="bg-primary py-3">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-primary-foreground text-xs">
          <span>Criado por <strong className="font-bold">JVA Sistemas</strong></span>
          <span className="hidden sm:inline">•</span>
          <a
            href={WHATSAPP_JVA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            (15) 99733-2343
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
