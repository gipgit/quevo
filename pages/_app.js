// pages/_app.js
import '../src/app/global.css'; 
import '../src/app/main.css'; 

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;