import React, { useState } from 'react';
import ParticipantForm from './components/ParticipantForm';
import ParticipantList from './components/ParticipantList';
import './App.css'; // Importa o CSS principal da aplicação

function App() {
  // Estado dos participantes
  const [participants, setParticipants] = useState([]);
  
  // Estado dos detalhes do evento (NOVOS)
  const [giftValue, setGiftValue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventAddress, setEventAddress] = useState('');

  // Estado da UI
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers dos Participantes ---

  const addParticipant = (name, phone) => {
    setParticipants([...participants, { id: Date.now(), name, phone }]);
  };

  const removeParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // --- Lógica Principal do Sorteio ---

  const handleDraw = async () => {
    // Validação
    if (participants.length < 2) {
      setMessage('Adicione pelo menos 2 participantes.');
      return;
    }
    if (!giftValue || !eventDate || !eventAddress) {
      setMessage('Preencha todos os detalhes do evento (Valor, Data e Local).');
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

    // 2. Cria os pares
    const pairs = [];
    for (let i = 0; i < shuffled.length; i++) {
      const gifter = shuffled[i];
      const giftee = shuffled[(i + 1) % shuffled.length]; // O próximo da lista (circular)
      
      // Validação simples (embora rara)
      if (gifter.id === giftee.id) {
          setMessage('Erro no sorteio. Tente novamente.');
          setIsLoading(false);
          return;
      }
      
      // Monta o objeto com TODOS os dados que a API precisa
      pairs.push({
        gifterName: gifter.name,
        gifterPhone: gifter.phone,
        gifteeName: giftee.name,
        giftValue: giftValue,       // {{3}}
        eventDate: eventDate,       // {{4}}
        eventAddress: eventAddress  // {{5}}
      });
    }

    // 3. Envia para a Serverless Function
    try {
      const response = await fetch('/api/send-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs }), // Envia o array de pares completo
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Sorteio realizado! Mensagens enviadas com sucesso.');
      } else {
        setMessage(`Erro ao enviar: ${data.error || 'Falha no servidor.'}`);
      }
    } catch (error) {
      setMessage('Erro de conexão. Verifique o console (F12).');
      console.error("Erro no fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sorteador de Amigo Secreto 🎅</h1>
      </header>
      
      <main>
        {/* NOVOS CAMPOS DE DETALHES DO EVENTO */}
        <div className="event-details">
          <h2>Detalhes do Evento</h2>
          
          <div className="form-group">
            <label htmlFor="giftValue">💰 Valor Estipulado (ex: R$ 50,00)</label>
            <input
              type="text"
              id="giftValue"
              value={giftValue}
              onChange={(e) => setGiftValue(e.target.value)}
              placeholder="Ex: R$ 50,00"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="eventDate">🗓️ Quando (Data e Hora)</label>
            <input
              type="text"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              placeholder="Ex: 20/12 às 20h"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="eventAddress">🏠 Onde (Endereço)</label>
            <input
              type="text"
              id="eventAddress"
              value={eventAddress}
              onChange={(e) => setEventAddress(e.target.value)}
              placeholder="Ex: Casa da Bianca"
            />
          </div>
        </div>

        {/* COMPONENTES DE PARTICIPANTES */}
        <ParticipantForm onAdd={addParticipant} />
        <ParticipantList participants={participants} onRemove={removeParticipant} />
        
        {/* BOTÃO PRINCIPAL */}
        <div className="draw-section">
          <button 
            onClick={handleDraw} 
            disabled={isLoading || participants.length < 2}
            className="draw-button"
          >
            {isLoading ? 'Sorteando e Enviando...' : `Sortear e Enviar para ${participants.length} pessoas!`}
          </button>
          
          {message && (
            <p className={`feedback-message ${message.includes('Erro') ? 'error' : 'success'}`}>
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;