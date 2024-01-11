import { useContext } from "react"
import { UserContext } from "../App"
import './PullRequest.css'

function PullRequest({ pullRequest }) {
   const user = useContext(UserContext)

   var classes = ["item"]
   if (pullRequest.requested_reviewers && pullRequest.requested_reviewers.includes(r => r.id == user.id)) {
      classes.push("reviewer")
   }

   return (
    <div className={classes.join(' ')}>
      <h3><a href={pullRequest.url}>{pullRequest.title}</a></h3>

   </div>
   )
}

export default PullRequest