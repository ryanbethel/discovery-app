const arc = require('@architect/functions')
const data = require('@begin/data')
const dataTable = require('./data-table')
const Fuse = require('fuse.js')
const xss = require('xss')

async function page (req) {
  const query = req.queryStringParameters
  const search = xss(query.search)
  const category = xss(query.category)



  let reposMeta
  try {
    reposMeta = await data.get({ table: 'repos', key: 'all-repos-meta' })
    const updatedAt = reposMeta ? new Date(reposMeta.updatedAt) : null
    if (!reposMeta || ((updatedAt.valueOf() + 60 * 60 * 1000) <= Date.now())) {
      await arc.events.publish({ name: 'reindex-data', payload: { trigger: 'get-index' }, })
    }
  }
  catch (e) { console.log(e) }

  let filteredRepos = reposMeta.data.map(r => r.name)
  if (search && reposMeta) {
    try {
      const repoReadmes = await Promise.all(reposMeta.data.map(async repo => await data.get({ table: 'repos', key: repo.name })))
      const fuse = new Fuse(repoReadmes, { ignoreLocation: true, keys: [ 'data.name', 'data.readme.content' ], includeScore: true })
      const results = fuse.search(search)
      filteredRepos = results.filter(i => i.score <= 0.1).map(repo => repo.item.data.name)
    }
    catch (e){console.log(e)}
  }

  const categories = reposMeta && reposMeta.data.map(repo => repo.discovery?.category)
  const categorySet = new Set(categories)
  const tableData = reposMeta ? reposMeta.data.map(repo => ({ name: repo.name, url: repo.url, category: repo?.discovery?.category, tags: repo?.discovery?.tags })) : []
  const table = dataTable(tableData, filteredRepos, [ ...categorySet ])




  return {
    status: 200,
    html: /* html*/`
      <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>login page</title>
            <meta name="description" content="a page with some links">
            <link href="${arc.static('/css/tailwind.css')}" rel="stylesheet">
          </head>
          <body>
            <div class="bg-white">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="max-w-5xl mx-auto">
                  <div class="max-w-7xl mx-auto pt-16 pb-10 px-4 sm:pt-24 sm:pb-10 sm:px-6 lg:px-8 lg:flex lg:justify-between">
                    <div class="max-w-xl">
                      <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">Begin Examples</h2>
                      <p class="mt-5 text-xl text-gray-500">Start building today. Search from our library of sample projects.</p>
                    </div>
                    <form id="filterform" method="get" action="/"=></form> 
                    <div class="mt-10 w-full max-w-xs">
                      <label for="currency" class="block text-base font-medium text-gray-500">Category</label>
                      <div class="mt-1.5 relative">
                      <select form="filterform"  onchange="categoryFilter()" id="category" name="category" class="appearance-none block w-full bg-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-base text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="">all</option>
                        ${[ ...categorySet ].filter(i => i).map(cat => `<option ${category === cat ? 'selected' : ''} "${cat}" > ${cat}</option >`)}
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 px-2 flex items-center">
                        <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div class="mt-5 w-full max-w-xs">
                      <label for="email" class="block text-base font-medium text-gray-500">Text Search</label>
                      <div class="mt-1 flex rounded-md shadow-sm">
                        <div class="relative flex items-stretch flex-grow focus-within:z-10">
                          <input ${search ? `value=${search}` : ''} form="filterform" type="text" name="search" id="search" class= "focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-3 sm:text-sm border-gray-300" placeholder="" >
                        </div>
                        <button form="filterform" type="submit" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                          </svg>
                          <span>Search</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                  <div>
                    <div class=" my-5">
                      <h3 class="text-lg leading-6 font-medium text-gray-900">
                        Example Projects
                      </h3>
                    </div>

                    ${table}

                  </div>
                  </div>
                </div>
            <script type="module" src="${arc.static('/assets/power-table.js')}"></script>
            </body>
          </html>`
  }
}

exports.handler = arc.http.async(page)
