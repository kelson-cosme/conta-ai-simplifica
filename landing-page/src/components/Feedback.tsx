import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export function InfiniteMovingCardsDemo() {
  return (
    <div className="pt-18 pb-18 rounded-md flex flex-col antialiased   items-center justify-center relative overflow-hidden">

        <h1 className="text-4xl font-bold text-white">O que nossos clientes dizem</h1>
        <p>MEIs e contadores que já transformaram sua rotina com o NFEasy</p>
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Economizei pelo menos 10 horas por mês com o NFEasy. Agora consigo focar no crescimento do meu negócio em vez de ficar perdido com planilhas.",
    name: "Carlos Silva",
    title: "MEI - Designer Gráfico",
  },
  {
    quote:
      "Como contador, o NFEasy me permite atender mais clientes MEI com a mesma qualidade. A automatização dos relatórios foi um divisor de águas.",
    name: "Ana Oliveira",
    title: "Contadora",
  },
  {
    quote: "Finalmente uma solução acessível para nós, pequenos empreendedores. O assistente de IA me ajuda a entender melhor meu fluxo de caixa.",
    name: "Roberto Santos",
    title: "MEI - Consultor de TI",
  }

];
