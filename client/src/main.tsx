import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <AuthProvider>
            <AppProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#fff',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '14px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                        },
                        success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
                    }}
                />
            </AppProvider>
        </AuthProvider>
    </BrowserRouter>
)
