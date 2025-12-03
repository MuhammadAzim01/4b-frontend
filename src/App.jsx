import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';;

import { ModalProvider } from './context/ModalContext';
import { InventoryProvider } from './context/InventoryContext';

import Router from './router/Router';


function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" duration={2000} toastOptions={{
        className: 'border border-gray-200 shadow-lg p-4'
      }} />
      <ModalProvider>
        <InventoryProvider>
          <RouterProvider router={Router} />
        </InventoryProvider>
      </ModalProvider>
    </QueryClientProvider>
  );
}

export default App;
