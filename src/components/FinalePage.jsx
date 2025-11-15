import React from 'react'

const FinalePage = () => {
  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <div className="check-icon">✔</div>
        <h1>
          Merci pour votre <br /> confiance
        </h1>
        <p className="subtitle">
          J'espère que vous avez aimé le site web
        </p>

        <div className="confirmation-box">
          <p className="status">Votre commande a été confirmée avec succès</p>
          <p >
            Vous recevrez un email de confirmation sous peu avec les détails de votre commande.
          </p>
        </div>

        <div className="buttons">
          <button className="btn-yellow">Retour à l'accueil</button>
          <button className="btn-gray">Voir mes commandes</button>
        </div>

        <footer>© 2025 ESBEAND CLOTHES</footer>
      </div>
    </div>
  )
}

export default FinalePage