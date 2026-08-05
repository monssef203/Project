import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">⌚</span>
              <span className="font-display text-xl font-bold">WatchStore</span>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed max-w-md">
              Votre destination de confiance pour les montres de qualité au Maroc. 
              Collection soigneusement sélectionnée, livraison rapide dans tout le royaume.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gold-400">Navigation</h4>
            <ul className="space-y-2 text-sm text-navy-200">
              <li><Link to="/catalog" className="hover:text-white transition-colors">Catalogue</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Mon Panier</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Mon Compte</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gold-400">Contact</h4>
            <ul className="space-y-2 text-sm text-navy-200">
              <li>📍 Casablanca, Maroc</li>
              <li>📞 +212 5 22 00 00 00</li>
              <li>✉️ contact@watchstore.ma</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-navy-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-navy-300">
            © 2024 WatchStore. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-navy-300">Paiement sécurisé</span>
            <span className="text-xl">💳</span>
            <span className="text-xl">🏦</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
