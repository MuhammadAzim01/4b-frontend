import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';;
import { ModalProvider } from './context/ModalContext';
import { InventoryProvider } from './context/InventoryContext';

import Router from './router/Router';


function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <InventoryProvider>
          <RouterProvider router={Router} />
        </InventoryProvider>
      </ModalProvider>
    </QueryClientProvider>
  );
}

export default App;
