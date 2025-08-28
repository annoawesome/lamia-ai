import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './AccountPage';
import '../../css/style.css';
import '../../css/account.css';

const domNode = document.getElementById('root') as HTMLDivElement;
const root = createRoot(domNode);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);