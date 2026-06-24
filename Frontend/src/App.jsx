import React from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Selement from './Selement'
import Home from './Home'
const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/:id' element={<Selement/>}></Route>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App