const UserDB = {
    get() {
        return JSON.parse(localStorage.getItem("github_user")) ?? undefined
    },
    set(user) {
        localStorage.setItem("github_user", JSON.stringify(user))
    }
}

export default UserDB;