import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase } from '../database/db';
import { seedDatabase } from '../database/queries';

const DatabaseContext = createContext(null);

export function DatabaseProvider({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await getDatabase();
        await seedDatabase();
        setIsReady(true);
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    }
    init();
  }, []);

  if (!isReady) {
    return null; // Can show a splash screen here
  }

  return (
    <DatabaseContext.Provider value={{ isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

export default DatabaseContext;
