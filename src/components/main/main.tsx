// import UserCard from "./users_card/user_card"
import FileUpload from "./file_loyaut/file_loyaut"
import Styles from "./main.module.css"
import UserList from "./users_selector/users_selector"
import UsersSort from "./users_sort/users_sort"
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
          <div className={Styles.users__content}>
            <UserList />
          </div>
        </div>
        <div className={Styles.sort__wrapper_users}>
          <UsersSort />
        </div>
      </div>
    </main>
  )
}

export default Main