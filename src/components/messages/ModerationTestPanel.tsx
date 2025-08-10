import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ModerationResult {
  isBlocked: boolean;
  infractions: Array<{
    type: string;
    matches: string[];
    severity: string;
  }>;
  message?: string;
}

const ModerationTestPanel = () => {
  const [testMessage, setTestMessage] = useState('');
  const [result, setResult] = useState<ModerationResult | null>(null);
  const [testing, setTesting] = useState(false);

  const testCases = [
    {
      category: 'Emails',
      examples: [
        'Mi email es juan@gmail.com',
        'Contáctame en mi-correo[at]hotmail.com',
        'Escríbeme a artista(arroba)yahoo.es'
      ]
    },
    {
      category: 'Teléfonos',
      examples: [
        'Mi teléfono es 555-123-456',
        'Llámame al +34 666 777 888',
        'Mi WhatsApp es 123456789'
      ]
    },
    {
      category: 'Redes Sociales',
      examples: [
        'Búscame en Instagram como @miartista',
        'Mi Twitter es twitter.com/artista',
        'Hablemos por Telegram: @usuario'
      ]
    },
    {
      category: 'Pagos',
      examples: [
        'Te paso mi PayPal: usuario@paypal.com',
        'Hazme un Bizum al 666777888',
        'Pago por Stripe directo'
      ]
    },
    {
      category: 'Enlaces',
      examples: [
        'Visita mi web en miportfolio.com',
        'Mira mis fotos en ejemplo.net/galeria'
      ]
    }
  ];

  const testModeration = async (message: string) => {
    setTesting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "Debes estar logueado para probar",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('moderate-message', {
        body: {
          content: message,
          userId: user.user.id
        }
      });

      if (error) throw error;

      setResult(data);
      
      if (data.isBlocked) {
        toast({
          title: "Mensaje Bloqueado",
          description: `Detectado: ${data.infractions[0]?.type}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Mensaje Permitido",
          description: "No se detectaron infracciones",
        });
      }
    } catch (error) {
      console.error('Error testing moderation:', error);
      toast({
        title: "Error",
        description: "Error al probar moderación",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'severe': return 'secondary';
      case 'warning': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Panel de Pruebas de Moderación
          </CardTitle>
          <CardDescription>
            Prueba el sistema de moderación con diferentes tipos de contenido prohibido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mensaje de Prueba
            </label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Escribe un mensaje para probar la moderación..."
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={() => testModeration(testMessage)}
            disabled={!testMessage.trim() || testing}
            className="w-full"
          >
            {testing ? 'Analizando...' : 'Probar Moderación'}
          </Button>

          {result && (
            <Card className={`border-2 ${result.isBlocked ? 'border-red-200' : 'border-green-200'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  {result.isBlocked ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className="font-medium">
                    {result.isBlocked ? 'Mensaje Bloqueado' : 'Mensaje Permitido'}
                  </span>
                </div>
                
                {result.infractions && result.infractions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Infracciones detectadas:</p>
                    {result.infractions.map((infraction, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(infraction.severity)}>
                          {infraction.type}
                        </Badge>
                        <span className="text-sm">
                          Patrones: {infraction.matches.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.message && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {result.message}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Casos de Prueba Predefinidos</CardTitle>
          <CardDescription>
            Haz clic en cualquier ejemplo para probarlo automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {testCases.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                  {category.category}
                </h4>
                <div className="grid gap-2">
                  {category.examples.map((example, exampleIndex) => (
                    <Button
                      key={exampleIndex}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto p-3"
                      onClick={() => {
                        setTestMessage(example);
                        testModeration(example);
                      }}
                      disabled={testing}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModerationTestPanel;