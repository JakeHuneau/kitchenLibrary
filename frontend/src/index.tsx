import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import KitchenLibrary from './KitchenLibrary';
import { CookiesProvider } from 'react-cookie';

ReactDOM.render(
  <React.StrictMode>
      <CookiesProvider>
    <KitchenLibrary />
      </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
