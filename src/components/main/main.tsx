// import UserCard from "./users_card/user_card"
import FileUpload from "./file_loyaut/file_loyaut"
import Styles from "./main.module.css"
function Main() {
  return (
    <main className={`${Styles.main} container`}>
      <div className={Styles.users__wrapper}>

        <div className={Styles.userDataContainer_wrapper}>
          <div className={Styles.userDataContent}>
            <h2>Данные</h2>
          </div>
          <div className={Styles.userDataContent}>
            <FileUpload />
          </div>
        </div>
        <div className={Styles.usersadres_wrapper}>
cddddddddddd
        </div>
      </div>
    </main>
  )
}

export default Main