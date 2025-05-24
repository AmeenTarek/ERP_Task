import { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showAddedToCart = (productName) => {
    const id = Date.now();
    const message = `${productName} added to cart`;
    
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { id, message }
    ]);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider value={{ showAddedToCart }}>
      {children}
      <div className="notification-container">
        {notifications.map(notification => (
          <Toast
            key={notification.id}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 