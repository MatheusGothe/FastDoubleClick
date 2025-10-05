import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Timer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [firstClickTime, setFirstClickTime] = useState<number | null>(null);
  const [isWaitingSecondClick, setIsWaitingSecondClick] = useState(false);
  const [lastRecordedTime, setLastRecordedTime] = useState<number | null>(null);

  const handleButtonClick = async () => {
    const now = Date.now();

    if (!isWaitingSecondClick) {
      // First click
      setFirstClickTime(now);
      setIsWaitingSecondClick(true);
      setLastRecordedTime(null);
      toast({
        title: "Primeiro clique registrado!",
        description: "Clique novamente para medir o tempo.",
      });
    } else {
      // Second click
      if (firstClickTime) {
        const timeDiff = now - firstClickTime;
        
        try {
          const response = await fetch("http://localhost:3000/registros", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ time: timeDiff }),
          });

          if (!response.ok) throw new Error("Erro ao salvar registro");

          setLastRecordedTime(timeDiff);
          toast({
            title: "✨ Tempo registrado!",
            description: `${timeDiff}ms entre os cliques.`,
          });
        } catch (error) {
          console.error("Error saving record:", error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar o registro.",
            variant: "destructive",
          });
        }
      }
      
      setIsWaitingSecondClick(false);
      setFirstClickTime(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-foreground">
            Fast Double-Click
          </h1>
          <p className="text-xl text-muted-foreground">
            Teste sua velocidade de reação
          </p>
        </div>

        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center text-primary">
              Clique duas vezes no botão
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {isWaitingSecondClick
                ? "Aguardando segundo clique..."
                : "Pronto para começar"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Button
                onClick={handleButtonClick}
                size="lg"
                className={`h-40 w-40 rounded-full text-xl font-bold transition-all duration-300 ${
                  isWaitingSecondClick
                    ? "animate-pulse bg-primary hover:bg-primary/90 scale-110"
                    : "bg-primary hover:bg-primary/90"
                }`}
                style={{
                  boxShadow: isWaitingSecondClick
                    ? "0 0 40px hsl(142 76% 36% / 0.5)"
                    : "0 0 20px hsl(142 76% 36% / 0.3)",
                }}
              >
                <Timer className="h-12 w-12" />
              </Button>
            </div>

            {lastRecordedTime !== null && (
              <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm text-muted-foreground">Último tempo registrado:</p>
                <p className="text-4xl font-bold text-primary">
                  {lastRecordedTime} ms
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={() => navigate("/historico")}
                variant="secondary"
                className="w-full gap-2"
                size="lg"
              >
                <History className="h-5 w-5" />
                Ver Histórico de Registros
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
