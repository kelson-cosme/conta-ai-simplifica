import { HoverEffect } from "@/components/ui/card-hover-effect";

export function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto ">
      <h1 className="text-white font-bold text-4xl">Recursos Poderosos</h1>
      <p className="text-gray-400">Tudo o que você precisa para simplificar sua contabilidade como MEI</p>
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
  {
    title: "Processamento Automático de NF-e",
    description:
      "Envie seus XMLs e deixe nosso sistema extrair todas as informações importantes automaticamente, sem esforço.",
    link: "https://stripe.com",
  },
  {
    title: "Dashboard Intuitivo",
    description:
      "Visualize todos os dados das suas notas fiscais em um painel fácil de entender, com gráficos e métricas úteis.",
    link: "https://netflix.com",
  },
  {
    title: "Assistente de IA",
    description:
      "Nosso assistente virtual ajuda a interpretar os dados e dá insights valiosos para sua gestão financeira.",
    link: "https://google.com",
  },
  {
    title: "Relatórios Automáticos",
    description:
      "Gere relatórios completos para seu contador ou para a Receita Federal com apenas um clique.",
    link: "https://meta.com",
  },
  {
    title: "Segurança de Dados",
    description:
      "Seus dados financeiros protegidos com criptografia de última geração e backups automáticos.",
    link: "https://amazon.com",
  },
  // {
  //   title: "Microsoft",
  //   description:
  //     "A multinational technology company that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, personal computers, and related services.",
  //   link: "https://microsoft.com",
  // },
];
