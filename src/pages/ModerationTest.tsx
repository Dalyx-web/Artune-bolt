import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ModerationTestPanel from '@/components/messages/ModerationTestPanel';

const ModerationTest = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Solo admins pueden acceder a las pruebas
  if (user.profile?.user_type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Pruebas de Moderación</h1>
            <p className="text-muted-foreground">
              Panel de pruebas para validar el sistema de moderación de mensajes
            </p>
          </div>
          
          <ModerationTestPanel />
        </div>
      </div>
    </div>
  );
};

export default ModerationTest;