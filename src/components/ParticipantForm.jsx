import React, { useState } from 'react';
import './ParticipantForm.css'; // <-- Importamos nosso CSS

// Validador simples para o formato (5547999998888)
const validatePhone = (phone) => {
  const regex = /^\d{10,14}$/; // Aceita números de 10 a 14 dígitos
  return regex.test(phone.replace(/\D/g, '')); // Limpa não-dígitos
};

function ParticipantForm({ onAdd }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!validatePhone(cleanPhone)) {
      setError('Telefone inválido. Use o formato com DDD (ex: 5547999998888).');
      return;
    }

    onAdd(name, cleanPhone);
    setName('');
    setPhone('');
  };

  return (
    <form onSubmit={handleSubmit} className="participant-form">
      <div className="form-group">
        <label htmlFor="name">
          Nome do Participante
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Bianca Nilsen"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">
          Nº de WhatsApp (com código do país + DDD)
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ex: 5547999998888"
        />
      </div>

      {error && (
        <p className="error-message">{error}</p>
      )}

      <button type="submit" className="add-button">
        Adicionar Participante
      </button>
    </form>
  );
}

export default ParticipantForm;