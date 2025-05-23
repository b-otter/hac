import { Link } from "react-router-dom";
import './logo.css'
function Logo() {
    return (
        <nav className='logo'>
            <ul>
                <li>
                    <Link to="/">CRYPTO</Link>

                </li>
            </ul>
        </nav>
    )
}

export default Logo