const tiny = require('tiny-json-http')
const data = require('@begin/data')


async function getAllRepos () {
  let repos = await tiny.get({ url: 'https://api.github.com/orgs/begin-examples/repos', data: { 'per_page': 100, type: 'public' }, headers: { Authorization: `token ${process.env.GH_TOKEN}` } })
  return repos
}
async function getReadme ({ name, login }) {
  let readme = await tiny.get({ url: `https://api.github.com/repos/${login}/${name}/readme`, headers: { Authorization: `token ${process.env.GH_TOKEN}` } })
  return readme
}
async function getGithubRaw ({ name, login, file, branch }) {
  let meta = await tiny.get({ url: `https://raw.githubusercontent.com/${login}/${name}/${branch}/${file}`, headers: { Authorization: `token ${process.env.GH_TOKEN}` } })

  return meta
}

async function reindex () {
  const  allReposDb = await data.get({ table: 'repos', key: 'all-repos-meta' })
  const  reposGithub = await getAllRepos()
  const  registeredGithub = await getGithubRaw({ name: 'integration-tester', login: 'begin-examples', branch: 'main', file: 'registered-repositories.json' })
  const registered = JSON.parse(registeredGithub.body).registeredRepos
  const  registeredList = registered.map(repo => repo.name.replace('begin-examples/', ''))
  const registeredReposMetaData = reposGithub.body.filter(repo => registeredList.includes(repo.name)).map(r => ({ id: r.id, name: r.name, updatedAt: r.updated_at, url: r.html_url, discovery: registered.find(i => i.name === 'begin-examples/' +  r.name).discovery }))

  const now = new Date()
  await data.set({
    table: 'repos',
    key: 'all-repos-meta',
    updatedAt: now.toISOString(),
    data: registeredReposMetaData
  })
  let newRepos, updatedRepos, removedRepos
  if (allReposDb) {
    newRepos = registeredReposMetaData.filter((repo) => !allReposDb.data.find((item) => item.id === repo.id))
    updatedRepos = registeredReposMetaData.filter((repo) => {
      const index = allReposDb.findIndex((item) => item.id === repo.id)
      if (index !== -1) {
        const hasReadme = allReposDb[index].readme ? true : false
        const dbDate = new Date(allReposDb[index].updatedAt)
        const newDate = new Date(repo.updatedAt)
        const dateChanged = newDate.toValue() > dbDate.toValue()
        return dateChanged || !hasReadme
      }
      else {
        return false
      }
    })
    removedRepos = allReposDb.data.filter((repo) => !registeredReposMetaData.find((item) => item.id === repo.id))
  }
  else {
    newRepos = registeredReposMetaData
    updatedRepos = []
    removedRepos = []
  }

  const updatedWithReadmes = await Promise.all(
    updatedRepos.map((repo) =>
      getReadme({ name: repo.name, login: 'begin-examples' }).then((readme) => {
        const output = repo
        const content = Buffer.from(readme.body.content, 'base64').toString()
        const sha = readme.body.sha
        output.readme = { content, sha }
        return output
      }).catch(e => {
        console.log(e)
        return null
      })
    )
  )
  const newWithReadmes = await Promise.all(
    newRepos.map((repo) =>
      getReadme({ name: repo.name, login: 'begin-examples' }).then((readme) => {
        const output = repo
        const content = Buffer.from(readme.body.content, 'base64').toString()
        const sha = readme.body.sha
        output.readme = { content, sha }
        return output
      }).catch(e => {
        console.log(e)
        return null
      })
    )
  )
  const newDb = newWithReadmes.map(
    async ({ id, name, updatedAt, url, discovery, readme, }) =>
      await data.set({
        table: 'repos', key: name,
        data: {
          id,
          name,
          updatedAt,
          url,
          discovery,
          readme: { content: readme.content, sha: readme.sha,  },
        }
      })
  )
  const updatedDb = updatedWithReadmes.map(
    async ({ id, name, updatedAt, url, discovery, readme, }) =>
      await data.set({
        table: 'repos', key: name,
        data: {
          id,
          name,
          updatedAt,
          url,
          discovery,
          readme: { content: readme.content, sha: readme.sha,  },
        }
      })
  )
  const removedDb = removedRepos.map(
    async ({ name }) =>
      await data.destroy({ table: 'repos', key: name, })
  )
  await Promise.all([ ...newDb, ...updatedDb, removedDb ])

}

module.exports = reindex
