import { MessageCircle, Sparkles, HelpCircle, Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// ADICIONADO: Lendo a chave da API diretamente das variáveis de ambiente
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

const AIHelper = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ADICIONADO: Efeito para verificar a chave da API na inicialização
  useEffect(() => {
    if (!geminiApiKey) {
      setMessages([
        {
          id: '1',
          text: 'Olá! Para usar o Assistente IA, a chave da API do Google Gemini precisa ser configurada no seu arquivo .env.local. Por favor, peça ajuda ao desenvolvedor.',
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
      toast({
        title: "Configuração Pendente",
        description: "A chave da API do Gemini não foi encontrada.",
        variant: "destructive",
      });
    } else {
      setMessages([
        {
          id: '1',
          text: 'Olá! Sou seu assistente contábil. Posso te ajudar a entender impostos, regimes tributários e analisar suas notas fiscais. Como posso ajudar?',
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
  }, []);


  const commonQuestions = [
    "O que é ICMS e como é calculado?",
    "Qual a diferença entre Simples Nacional e Lucro Presumido?",
    "Posso deduzir gastos com alimentação?",
    "Como funciona o MEI?",
    "Quando devo recolher o DAS?",
    "O que são PIS e COFINS?"
  ];

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // A verificação da chave agora é feita no início
    if (!geminiApiKey) {
      return "A chave da API do Google Gemini não está configurada. Por favor, adicione-a ao arquivo .env.local.";
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Você é um assistente especializado em contabilidade para micro e pequenos empreendedores brasileiros. Responda de forma simples e didática, usando exemplos práticos quando possível. Pergunta: ${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro da API Gemini:', response.status, errorData);
        
        if (response.status === 400) {
          return "Chave API inválida ou problema na requisição. Verifique sua chave API do Google Gemini.";
        } else if (response.status === 403) {
          return "Acesso negado. Verifique se sua chave API do Google Gemini está correta e ativa.";
        } else if (response.status === 429) {
          return "Muitas requisições. Aguarde um momento antes de tentar novamente.";
        }
        
        throw new Error(`Erro na API do Gemini: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Resposta inesperada da API:', data);
        return "Não consegui gerar uma resposta. Tente reformular sua pergunta.";
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro ao comunicar com Gemini:', error);
      return "Erro de conexão com a IA. Verifique sua internet e tente novamente.";
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText) return;

    // REMOVIDO: A verificação da chave é feita antes de enviar
    if (!geminiApiKey) {
      toast({
        title: "Chave API não configurada",
        description: "A VITE_GEMINI_API_KEY precisa estar no seu arquivo .env.local.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(messageText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter resposta da IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Assistente IA - ContábilFácil
        </CardTitle>
        <CardDescription>
          Tire suas dúvidas sobre contabilidade e impostos com nossa IA
        </CardDescription>
        
        {/* REMOVIDO: O input da chave da API foi removido da interface */}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  Digitando...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {commonQuestions.slice(0, 3).map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(question)}
                className="text-xs"
                disabled={isLoading || !geminiApiKey} // ADICIONADO: Desabilita se não houver chave
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                {question}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta sobre contabilidade..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !geminiApiKey} // ADICIONADO: Desabilita se não houver chave
            />
            <Button 
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim() || !geminiApiKey} // ADICIONADO: Desabilita se não houver chave
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIHelper;