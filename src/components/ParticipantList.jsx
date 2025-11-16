import React from 'react';
import './ParticipantList.css'; // <-- Importamos nosso CSS

function ParticipantList({ participants, onRemove }) {
  if (participants.length === 0) {
    return (
      <div className="empty-list">
        Nenhum participante adicionado ainda.
      </div>
    );
  }

  return (
    <div className="list-container">
      <h2>
        Participantes ({participants.length})
      </h2>
      <ul className="participant-list">
        {participants.map((participant) => (
          <li key={participant.id} className="participant-item">
            <div className="participant-info">
              <p className="participant-name">{participant.name}</p>
              <p className="participant-phone">+{participant.phone}</p>
            </div>
            <button
              onClick={() => onRemove(participant.id)}
              className="remove-button"
              aria-label={`Remover ${participant.name}`}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ParticipantList;