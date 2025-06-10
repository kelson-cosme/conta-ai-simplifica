import { MessageCircle, Sparkles, HelpCircle, Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIHelper = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente contábil. Posso te ajudar a entender impostos, regimes tributários e analisar suas notas fiscais. Como posso ajudar?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const { toast } = useToast();

  const commonQuestions = [
    "O que é ICMS e como é calculado?",
    "Qual a diferença entre Simples Nacional e Lucro Presumido?",
    "Posso deduzir gastos com alimentação?",
    "Como funciona o MEI?",
    "Quando devo recolher o DAS?",
    "O que são PIS e COFINS?"
  ];

  const getAIResponse = async (userMessage: string): Promise<string> => {
    if (!geminiApiKey) {
      return "Por favor, configure sua chave da API do Google Gemini para usar o assistente IA.";
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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
        throw new Error('Erro na API do Gemini');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro ao comunicar com Gemini:', error);
      return "Desculpe, não consegui processar sua pergunta no momento. Tente novamente em alguns instantes.";
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText) return;

    if (showApiInput && !geminiApiKey) {
      toast({
        title: "Chave API necessária",
        description: "Configure sua chave da API do Google Gemini primeiro.",
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
        
        {showApiInput && (
          <div className="space-y-2">
            <Input
              placeholder="Cole sua chave API do Google Gemini aqui"
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
            />
            <Button 
              onClick={() => setShowApiInput(false)}
              disabled={!geminiApiKey}
              size="sm"
              className="w-full"
            >
              Configurar IA
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {!showApiInput && (
          <>
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
                    disabled={isLoading}
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
                  disabled={isLoading}
                />
                <Button 
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIHelper;