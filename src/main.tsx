import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useAuth } from '@/store/useAuth';

// Read the session snapshot the server inlined into this document BEFORE the
// first render: the header then paints with the right identity on frame one,
// with no logged-out flash and no second guess about who is signed in.
useAuth.getState().hydrate();

createRoot(document.getElementById('root')!).render(<App />);
