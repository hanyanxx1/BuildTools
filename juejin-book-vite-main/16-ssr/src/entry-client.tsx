import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { fetchData } from './entry-server';

// @ts-ignore
const data = window.__SSR_DATA__ ?? fetchData();

ReactDOM.hydrate(
  <React.StrictMode>
    <App data={data}/>
  </React.StrictMode>,
  document.getElementById('root')
)
