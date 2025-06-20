
import './App.css'
import {NavbarDemo} from "@/components/NavBar"
import { CardHoverEffectDemo } from './components/Card';
import {MacbookScrollDemo} from "@/components/Mac"
import ComoFunciona from './components/ComoFunciona';

function App() {

  return (
    <section >
    < NavbarDemo/>
      <MacbookScrollDemo/>
      <CardHoverEffectDemo/>

      <ComoFunciona/>
    </section>
  )
}


export default App
