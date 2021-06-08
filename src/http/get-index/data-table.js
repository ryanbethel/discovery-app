module.exports = dataTable
function dataTable (data, filtered, categories) {
  const html = /* html*/`<div class="flex flex-col">
   <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
    <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
      <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table id="examples" is="power-table" filter = '[{"id":"category","columns":1,"event":"onchange"}]' sort = '{"defaultColumn":0,"sortable":[0,1,2]}'
 class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">view</span>
              </th>
            </tr>
          </thead>
          <tbody  class="bg-white divide-y divide-gray-200">
        ${data && data.map(row => `<tr ${filtered.includes(row.name) || !categories.includes(row.category) ? 'style="display: ;"' : 'style="display: none ;"'} >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${row.name}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${row.category || `<span class="text-gray-300">none</span>`}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${row.tags || `<span class="text-gray-300">none</span>`}
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a href="${row.url}" class="text-indigo-600 hover:text-indigo-900">View</a>
              </td>
            </tr>`
  ).join('\n')}
          </tbody>
        </table>
      </div>
  </div>
  </div>
</div>`
  return html
}
