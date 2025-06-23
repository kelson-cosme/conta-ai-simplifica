
import './App.css'
import {NavbarDemo} from "@/components/NavBar"
import { CardHoverEffectDemo } from './components/Card';
import {MacbookScrollDemo} from "@/components/Mac"
import ComoFunciona from './components/ComoFunciona';
import {InfiniteMovingCardsDemo} from "@/components/Feedback"
import Planos from './components/Planos';
import Cta from './components/ui/Cta';
import Rodape from './components/Rodape';

function App() {

  return (
    <section >
    < NavbarDemo/>
      <MacbookScrollDemo/>
      <CardHoverEffectDemo/>

      <ComoFunciona/>
      <InfiniteMovingCardsDemo/>
      <Planos/>
      <Cta/>
      <Rodape/>
    </section>
  )
}


export default App
