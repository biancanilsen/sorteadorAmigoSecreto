import React, { useState } from 'react';
import ParticipantForm from './components/ParticipantForm';
import ParticipantList from './components/ParticipantList';

function App() {
  const [participants, setParticipants] = useState([]);
  const [message, setMessage] = useState(''); // Feedback para o usuário
  const [isLoading, setIsLoading] = useState(false);

  // Adiciona um novo participante
  const addParticipant = (name, phone) => {
    // Formata o telefone para o padrão da API (ex: 5547999998888)
    const formattedPhone = phone.replace(/\D/g, ''); 
    setParticipants([...participants, { id: Date.now(), name, phone: formattedPhone }]);
  };

  // Remove um participante
  const removeParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Lógica principal do sorteio
  const handleDraw = async () => {
    if (participants.length < 2) {
      setMessage('Adicione pelo menos 2 participantes.');
      return;
    }

    setIsLoading(true);
    setMessage('Sorteando e enviando mensagens...');

    // 1. Embaralha a lista (Algoritmo Fisher-Yates)
    let shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 2. Cria os pares (Gifter -> Giftee)
    const pairs = [];
    for (let i = 0; i < shuffled.length; i++) {
      const gifter = shuffled[i];
      const giftee = shuffled[(i + 1) % shuffled.length]; // O próximo da lista (circular)
      
      // Validação simples para evitar que a pessoa tire ela mesma (raro em >2, mas bom ter)
      if (gifter.id === giftee.id) {
          setMessage('Erro no sorteio. Tente novamente.');
          setIsLoading(false);
          return;
      }
      
      pairs.push({
        gifterName: gifter.name,
        gifterPhone: gifter.phone,
        gifteeName: giftee.name,
      });
    }

    // 3. Envia para o nosso "backend" (Serverless Function)
    try {
      const response = await fetch('/api/send-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Sorteio realizado! Mensagens enviadas.');
      } else {
        setMessage(`Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h1>Amigo Secreto 🎅</h1>
      
      <ParticipantForm onAdd={addParticipant} />
      <ParticipantList participants={participants} onRemove={removeParticipant} />
      
      <button 
        onClick={handleDraw} 
        disabled={isLoading || participants.length < 2}
        style={{ width: '100%', padding: '15px', fontSize: '18px', background: 'green', color: 'white' }}
      >
        {isLoading ? 'Enviando...' : 'Sortear e Enviar WhatsApp!'}
      </button>
      
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;