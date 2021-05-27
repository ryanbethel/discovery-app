const tiny = require('tiny-json-http')
const data = require('@begin/data')
// const begin = require('@architect/functions')


async function getAllRepos () {
  let repos = await tiny.get({ url: 'https://api.github.com/orgs/begin-examples/repos', data: { 'per-page': 100, private: false }, headers: { Authorization: `token ${process.env.GH_TOKEN}` } })
  return repos
}
async function getReadme ({ name, login }) {
  let readme = await tiny.get({ url: `https://api.github.com/repos/${login}/${name}/readme`, headers: { Authorization: `token ${process.env.GH_TOKEN}` } })
  return readme
}

async function reindex () {
  let allReposMeta = null
  try {
    allReposMeta = await data.get({ table: 'repos', key: 'all-repos-meta' })
    // [{data:{id,repoName,updated}}, {data:{id,repoName,updated}}]
  }
  catch (e) {
    console.log(e)
  }
  const allRepos = await getAllRepos()
  const now = Date.now()
  await data.set({ table: 'repos', key: 'all-repos-meta',  updatedAt: now, data: allRepos.body.map(({ id, name, updated_at }) => ({ id, repoName: name, updatedAt: updated_at })) })
  let newRepos, updatedRepos, removedRepos
  if (allReposMeta) {
    newRepos = allRepos.body.filter((repo) => !allReposMeta.data.find((item) => item.id === repo.id))
    updatedRepos = allRepos.body.filter((repo) => {
      const index = allReposMeta.findIndex((item) => item.id === repo.id)
      if (index !== -1) {
        const hasReadme = allReposMeta[index].readme ? true : false
        const dbDate = new Date(allReposMeta[index].updated_at)
        const newDate = new Date(repo.updated_at)
        const dateChanged = newDate > dbDate
        return dateChanged || !hasReadme
      }
      else {
        return false
      }
    })
    removedRepos = allReposMeta.data.filter((repo) => !allRepos.body.find((item) => item.id === repo.id))
  }
  else {
    newRepos = allRepos.body
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
      })
    )
  )
  const newDb = newWithReadmes.map(
    async ({ id, name, node_id, created_at, updated_at, pushed_at, readme }) =>
      await data.set({
        table: 'repos', key: name,
        data: {
          id,
          name,
          node_id,
          created_at,
          updated_at,
          pushed_at,
          readme: { create: { content: readme.content, sha: readme.sha } },
        },
      })
  )
  const updatedDb = updatedWithReadmes.map(
    async ({ id, name, node_id, created_at, updated_at, pushed_at, readme }) =>
      await data.set({
        table: 'repos', key: name,
        data: {
          id,
          name,
          node_id,
          created_at,
          updated_at,
          pushed_at,
          readme: { create: { content: readme.content, sha: readme.sha } },
        },
      })
  )
  const removedDb = removedRepos.map(
    async ({ name }) =>
      await data.destroy({ table: 'repos', key: name, })
  )
  await Promise.all([ ...newDb, ...updatedDb, removedDb ])

  // const delta = allRepos.body.filter((element) => {
  //     const matching = allDbRepos.find((i) => i.id === element.id);
  //     console.log({ matching });
  //     console.log({ updated_at: element.updated_at });
  //     let x = matching && matching !== [] ? matching.updated_at : undefined;
  //     return element.updated_at !== x;
  // });

  // console.log(delta[0]);
  // const deltaRepoPromiseArray = delta.slice(5).forEach((element) => getReadme({ name: element.name }));
  // const deltaRepoArray = await Promise.all(deltaRepoPromiseArray);
  // console.dir(deltaRepoArray);
  // use `console.dir` to print nested objects
  // console.dir(allUsers, { depth: null });

}

module.exports = reindex
  .js
