import GithubSettings from "../githubConfig"
import Secrets from "../secrets"
import UserDB from "../repositories/UserDB"
import RepositoryDB from "../repositories/RepositoryDB"
import batchTasks from "./utilities/batchTasks"

class Github {
    constructor(repositories = GithubSettings.repositories) {
        this.token = Secrets.GITHUB_TOKEN
        this.host = "https://api.github.com"
        this.validRepos = repositories ??  []
    }
    
    getCurrentUser() {
        return UserDB.get()
    }

    getCurrentRepositories() {
        return RepositoryDB.getList()
    }

    async githubFetch(endpoint) {
        const response = await fetch(`${this.host}${endpoint}`, {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": `Bearer ${this.token}`
            }
        })

        if (response.ok) {
            return response.json()
        } else {
            return { errorMessage: response.text() }
        }
    }

    async getUser() {
        if (this.user !== undefined) {
            return this.user;
        }
        let user = UserDB.get()
        if (user === undefined) {
            user = await this.githubFetch("/user")   
        }
        this.user = user
        return user
    }


    async getReposLegacy() {
        // Load cached data if not on memory
        if (this.repositories === undefined) {
            this.repositories = RepositoryDB.getList() ?? undefined
        }
        var validRepositories = [...this.validRepos]
        
        // Return in-memory cache
        if (this.repositories !== undefined) {
            const loadedRepos = this.repositories.map(p => p.name)
            const desiredRepos = validRepositories.map(p => p.repository)
            if (loadedRepos.toString() == desiredRepos.toString()) {
                return this.repositories
            }
        }

        var repositoryNames = validRepositories.map(r => r.repository)
        // Load content
        var buffer = []
        var fetch = true
        var page = 1
        do {
            console.log(">>> Fetching repositories")
            const response = await this.githubFetch(`/orgs/jobandtalent/repos?page=${page}`)
            console.log(">>> fetched repos: " + response)
            if (Array.isArray(response) && response.length > 0) {
                // Filter desired repositories
                const filteredRepos = response.filter(r => { return repositoryNames.includes(r.name)  })
                // Get names to remove already taken repositories from query
                const repoNames = filteredRepos.map(r => r.name)
                repositoryNames = repositoryNames.filter(r => { return !repoNames.includes(r) })
                // Add repositories to buffer
                buffer = buffer.concat(filteredRepos)
                // Request next page of repositories until
                page += 1
            } else {
                fetch = false
                console.error(response)
            }
        } while (fetch && repositoryNames.length > 0)

        // Saves locally to avoid fetching again
        this.repositories = buffer
        // Save to cache to avoid future requests
        RepositoryDB.save(this.repositories)
        // Returns the repositories instances
        return this.repositories
    }

    async getRepos() {
        // Load cached data if not on memory
        if (this.repositories === undefined) {
            this.repositories = RepositoryDB.getList() ?? undefined
        }
        var validRepositories = [...this.validRepos]
        
        // Return in-memory cache
        if (this.repositories !== undefined) {
            const loadedRepos = this.repositories.map(p => p.name)
            const desiredRepos = validRepositories.map(p => p.repository)
            if (loadedRepos.toString() == desiredRepos.toString()) {
                return this.repositories
            }
        }
        // Load content
        var tasksBuffer = []

        for (let index = 0; index < validRepositories.length; index++) {
            const repository = validRepositories[index];
            console.log(">>> Fetching repositories")
            const response = await this.githubFetch(`/repos/${repository.owner}/${repository.repository}`)
            console.log(">>> fetched repos: " + response)
            tasksBuffer.push(response)
            // if (Array.isArray(response) && response.length > 0) {
            //     // Filter desired repositories
            //     const filteredRepos = response.filter(r => { return validRepositories.includes(r.name)  })
            //     // Get names to remove already taken repositories from query
            //     const repoNames = filteredRepos.map(r => r.name)
            //     validRepositories = validRepositories.filter(r => { return !repoNames.includes(r) })
            //     // Add repositories to buffer
            //     buffer = buffer.concat(filteredRepos)
            //     // Request next page of repositories until
            //     page += 1
            // } else {
            //     fetch = false
            //     console.error(response)
            // }
        }
        // Saves locally to avoid fetching again
        var repositoryList = []
        for await (const task of batchTasks(tasksBuffer, 5)) {
            repositoryList.push(task)
        }
        this.repositories = repositoryList
        // Save to cache to avoid future requests
        RepositoryDB.save(this.repositories)
        // Returns the repositories instances
        return this.repositories
    }

    async getPullRequests(repositories) {
        var tasks = repositories.map(r => this.githubFetch(`/repos/${r.owner.login}/${r.name}/pulls`))
        var prs = await Promise.all(tasks)
        return prs
    }
}

export default Github