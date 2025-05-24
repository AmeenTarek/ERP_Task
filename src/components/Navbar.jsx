import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const itemCount = getCartItemsCount();

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link 
          to="/" 
          className="text-2xl font-bold tracking-tight hover:text-indigo-100 transition-colors"
        >
          ShopReact
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="font-medium hover:text-indigo-100 transition-colors"
          >
            Products
          </Link>
          <Link 
            to="/cart" 
            className="relative font-medium hover:text-indigo-100 transition-colors"
          >
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>Cart</span>
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 