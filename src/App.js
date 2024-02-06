import { Provider } from 'react-redux';
import './App.css';
import store from './utils/store';
import { RouterProvider } from 'react-router-dom';
import { router} from './routes/router';
import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import Notification from './components/Notification';

function App() {
  
  return (
    <Provider  store={store}>
     
      <RouterProvider router={router}/>
</Provider>
  );
}

export default App;
