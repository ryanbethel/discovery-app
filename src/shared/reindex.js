const tiny = require('tiny-json-http')
const data = require('@begin/data')
const matter = require('gray-matter')
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
  console.log(allRepos.body[0].html_url)
  const now = new Date()
  await data.set({ table: 'repos', key: 'all-repos-meta',  updatedAt: now.toISOString(), data: allRepos.body.map(({ id, name, updated_at, html_url }) => ({ id, repoName: name, updatedAt: updated_at, url: html_url })) })
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
        const frontmatter = matter(content)
        const sha = readme.body.sha
        output.readme = { content, sha, frontmatter }
        return output
      })
    )
  )
  const newWithReadmes = await Promise.all(
    newRepos.map((repo) =>
      getReadme({ name: repo.name, login: 'begin-examples' }).then((readme) => {
        const output = repo
        const content = Buffer.from(readme.body.content, 'base64').toString()
        const frontmatter = matter(content)
        const sha = readme.body.sha
        output.readme = { content, sha, frontmatter }
        return output
      })
    )
  )
  const newDb = newWithReadmes.map(
    async ({ id, name, node_id, created_at, updated_at, pushed_at, html_url, readme, }) =>
      await data.set({
        table: 'repos', key: name,
        data: {
          id,
          name,
          node_id,
          created_at,
          updated_at,
          pushed_at,
          url: html_url,
          readme: { content: readme.content, sha: readme.sha, frontmatter: readme.frontmatter.data },
        },
      })
  )
  const updatedDb = updatedWithReadmes.map(
    async ({ id, name, node_id, created_at, updated_at, pushed_at, html_url, readme, }) =>
      await data.set({
        table: 'repos', key: name,
        data: {
          id,
          name,
          node_id,
          created_at,
          updated_at,
          pushed_at,
          url: html_url,
          readme: { content: readme.content, sha: readme.sha, frontmatter: readme.frontmatter.data },
        },
      })
  )
  const removedDb = removedRepos.map(
    async ({ name }) =>
      await data.destroy({ table: 'repos', key: name, })
  )
  await Promise.all([ ...newDb, ...updatedDb, removedDb ])

}

module.exports = reindex
