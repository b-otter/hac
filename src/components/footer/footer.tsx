import Style from './footer.module.css'

function Footer() {
    return (
        <div className={`${Style.footer__wrapper} container`} >
            <h1 className={Style.footer}>Footer</h1>
        </div>
    )
}

export default Footer