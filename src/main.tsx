import { createRoot } from 'react-dom/client'
import "./styles/index.scss"
import App from './App'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/configs/queryClient'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
