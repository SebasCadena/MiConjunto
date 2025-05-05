jsx
import React from 'react';

function MetodoPagoOption({ metodo }) {
  let imagenSrc = '';
  let nombreBanco = '';

  switch (metodo) {
    case 'nequi':
      imagenSrc = '/src/img/bancos/nequi.webp';
      nombreBanco = 'Nequi';
      break;
    case 'davivienda':
      imagenSrc = '/src/img/bancos/davivienda.png';
      nombreBanco = 'Davivienda';
      break;
    case 'bancolombia':
      imagenSrc = '/src/img/bancos/Bancolombia.png';
      nombreBanco = 'Bancolombia';
      break;
    default:
      return <span>Método no reconocido</span>;
  }

  return (
    <div>
      <img src={imagenSrc} alt={nombreBanco} className="w-10 h-10 inline-block mr-2" />
      <span>{nombreBanco}</span>
    </div>
  );
}

export default MetodoPagoOption;