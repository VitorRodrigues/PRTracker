import './Repository.css'
import PullRequest from "./PullRequest"

function Repository({ repository }) {

    return (<>
    <section className="repository-wrapper">
        <h2 className="repository-title"><a href={repository.html_url}>{repository.full_name}</a></h2>
        <div className="pullrequest-list">
        {repository.pull_requests && repository.pull_requests.map(pr => (
            <PullRequest pullRequest={pr} key={pr.id} />
        ))}
        {repository.open_issues_count == 0 && (<p>No open Pull Requests</p>)}
        </div>
    </section>
    </>)
}

export default Repository