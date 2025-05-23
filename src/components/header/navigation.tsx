import { Link } from "react-router-dom"
import Styles from "./navigation.module.css"

function Navigation() {
  return (
    <nav className={Styles.navigation}>
      <ul>
        <li>
          <Link to="/">Калькулятор</Link>
        </li>
        <li>
          <Link to="/">тарифы</Link>
        </li>
        <li>
          <Link to="/">сводка</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation