import { Route, Routes } from 'react-router-dom'
import './App.css'
// import Footer from './components/footer/footer'
// import Header from './components/header/header'
import Main from './components/main/main'

function App() {

  return (
    <>
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/" element={''} />
        <Route path="/" element={''} />
        <Route path="/" element={''} />
      </Routes>
      {/* <Footer /> */}
    </>
  )
}

export default App
