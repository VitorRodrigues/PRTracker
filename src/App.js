import logo from './logo.svg';
import './App.css';
import { createContext, useContext, useEffect, useState } from 'react';
import Repository from './components/Repository';
import { GithubContext } from '.';

const UserContext = createContext()

function App() {

  const github = useContext(GithubContext)
  const [viewState, setViewState] = useState({ })

  useEffect(() => {
    async function fetchGithubUser() {
      const user = github.getUser()
      const repos =  github.getReposLegacy()

      Promise.all([user, repos])
      .then(values => {
        var repos = values[1]

        return github.getPullRequests(repos).then(v => {
          repos.forEach((repo, index) => {
            repo.pull_requests = v[index]
          });
          return [...values]
        })
      }).then(values => {
        // console.log(">>> received values");
        // console.log(values);
        setViewState({
          user: values[0],
          repos: values[1]
        })
      })
    }

    if (viewState.user === undefined || viewState.repos === undefined) { 
        fetchGithubUser()
    }
  }, [])

  return (
    <UserContext.Provider value={viewState.user}>
    <div className="App">
      <header className="App-header">
        {viewState.user === undefined && (
          <div>Loading content..</div>
        )}
        <div>
          {viewState.user && (<p>{(viewState.user.name)} ({(viewState.user.login)})</p>)}
          {viewState.repos && (
          <div className='repo-container'>
          {(viewState.repos.map((r) => (
            <Repository repository={r} key={`repo-${r.id}`}/>
          )))}</div>)}
          </div>
      </header>
    </div>
    </UserContext.Provider>
  );
}

export default App;
export { UserContext };