import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <a href="#" className="text-xl font-black text-primary">
          Neto Pedreiro
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#servicos" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Serviços
          </a>
          <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Contato
          </a>
          <a
            href="#contato"
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:brightness-110 transition-all"
          >
            Orçamento Grátis
          </a>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-border px-6 py-4 flex flex-col gap-3">
          <a href="#servicos" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground py-2">
            Serviços
          </a>
          <a href="#contato" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground py-2">
            Contato
          </a>
          <a
            href="#contato"
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg text-sm text-center"
          >
            Orçamento Grátis
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
