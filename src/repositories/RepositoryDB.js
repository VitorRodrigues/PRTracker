const RepositoryDB = {

    getList() {
        const list = JSON.parse(localStorage.getItem("fetched_repositories"))
        if (Array.isArray(list)) {
            return list
        } else {
            return undefined
        }
    },
    save(repositories) {
        if (Array.isArray(repositories)) {
            localStorage.setItem("fetched_repositories", JSON.stringify(repositories))
        } else {
            localStorage.removeItem("fetched_repositories")
        }
    }
}


export default RepositoryDB;