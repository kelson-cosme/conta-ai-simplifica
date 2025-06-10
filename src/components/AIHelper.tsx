import { MessageCircle, Sparkles, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AIHelper = () => {
  const commonQuestions = [
    "O que é ICMS?",
    "Quanto terei que pagar esse mês?",
    "Posso deduzir esse gasto?",
    "Qual o melhor regime tributário para mim?"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Assistente IA
        </CardTitle>
        <CardDescription>
          Tire suas dúvidas sobre contabilidade e impostos com nossa IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Perguntas frequentes:</h4>
          {commonQuestions.map((question, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3 hover:bg-muted"
              size="sm"
            >
              <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{question}</span>
            </Button>
          ))}
        </div>
        
        <div className="pt-4 border-t border-border">
          <Button className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Fazer uma pergunta personalizada
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIHelper;