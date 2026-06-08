import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Explore from './pages/Explore'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
    </Routes>
  )
}
