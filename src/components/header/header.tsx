import Logo from "./logo"
import Navigation from "./navigation"
import Style from './header.module.css'

function Header() {
  return (
    <header className={`${Style.header} container`}>
      <Logo />
      <Navigation />
    </header>
  )
}

export default Header