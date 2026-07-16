import { useEffect, useState } from "react";

export function Clock() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex flex-col items-end mr-2">
      <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider leading-none">
        {currentDateTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </span>
      <span className="text-xl font-black text-foreground tabular-nums leading-tight">
        {currentDateTime.toLocaleTimeString('pt-BR')}
      </span>
    </div>
  );
}
