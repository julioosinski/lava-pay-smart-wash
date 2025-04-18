
import { Link } from "react-router-dom";
import { WashingMachine } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-lavapay-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 flex items-center gap-2">
            <WashingMachine className="h-6 w-6" />
            <span className="text-lg font-semibold">LavaPay Smart Wash</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div>
              <h3 className="font-semibold mb-3">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-lavapay-300 transition-colors">Início</Link></li>
                <li><Link to="/admin" className="hover:text-lavapay-300 transition-colors">Admin</Link></li>
                <li><Link to="/owner" className="hover:text-lavapay-300 transition-colors">Proprietário</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Suporte</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-lavapay-300 transition-colors">Ajuda</Link></li>
                <li><Link to="#" className="hover:text-lavapay-300 transition-colors">Contato</Link></li>
                <li><Link to="#" className="hover:text-lavapay-300 transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-lavapay-700 text-center text-sm text-lavapay-300">
          <p>&copy; {new Date().getFullYear()} LavaPay Smart Wash. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
