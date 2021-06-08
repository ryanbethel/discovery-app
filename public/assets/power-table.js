/* eslint-disable no-undef */
/* eslint-disable fp/no-class */
class PowerTable extends HTMLTableElement {
  constructor () {
    super()
  }
  connectedCallback (){
    if (this.hasAttribute('filter')) {
      const filter = JSON.parse(this.getAttribute('filter'))
      filter.forEach(f => {
        const input = document.getElementById(f.id)
        input[f.event] = (e) => this.filterTable.bind(this)(this, e.target.value, f.columns)
        // run the filter once initialized
        // this.filterTable.bind(this)(this, input.value, f.columns)
      })
    }
    if (this.hasAttribute('sort')) {

      const sort = JSON.parse(this.getAttribute('sort'))
      const headerRow = this.querySelectorAll('tr')[0]
      const headerColumns = Array.from(headerRow.querySelectorAll('td,th'))
      const sortAscending = /* html*/`
    <span data-ascending style="display:none;">
      <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
      </svg>
    </span>`
      const sortDescending = /* html*/`
    <span data-descending style="display:none;">
      <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
      </svg>
    </span>`
      const unsorted = /* html*/`
    <span data-unsorted >
      <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
      </svg>
    </span>`
      function addControls (content) {
        return /* html*/`
      <span class="flex">
        <span>${content}</span>
        <span data-sort-control="unsorted">${unsorted + sortAscending + sortDescending}</span>
      </span>`
      }

      headerColumns.map((td, index) => {
        if (sort.sortable.includes(index)) {
          const content = td.innerHTML
          td.innerHTML = addControls(content)
          td.onclick = () => this.sortTable.bind(this)(this, index, sort.defaultColumn)
        }
      })
      // sort once initialized
      this.sortTable.bind(this)(this, sort.defaultColumn, sort.defaultColumn)
    }
  }



  filterTable (table, value, columns) {
    const trs = Array.from(table.querySelectorAll('tr'))
    trs.slice(1).forEach(tr => {
      const tds = Array.from(tr.querySelectorAll('td'))
      let show = false
      tds.map((td, index) => {
        const txtValue = td.textContent || td.innerText
        if ((columns === 'all' || columns === index || Array.from(columns).includes(index) ) && (txtValue.toUpperCase().includes(value.toUpperCase()))) show = true
      })
      tr.style.display = show ? '' : 'none'
    })
  }

  sortTable (table, sortBy, defaultSort) {
    const headerRow = table.querySelectorAll('tr')[0]
    const previousColumnState = headerRow.querySelectorAll('td,th').item(sortBy).querySelectorAll('span[data-sort-control]')[0].getAttribute('data-sort-control')

    // reset sort controls
    headerRow.querySelectorAll('td>span>span>span[data-ascending],th>span>span>span[data-ascending]')
      .forEach(span => span.setAttribute('style', 'display:none;'))
    headerRow.querySelectorAll('td>span>span>span[data-unsorted],th>span>span>span[data-unsorted]')
      .forEach(span => span.setAttribute('style', 'display: ;'))
    headerRow.querySelectorAll('td>span>span>span[data-descending],th>span>span>span[data-descending]')
      .forEach(span => span.setAttribute('style', 'display:none;'))
    headerRow.querySelectorAll('td>span>span[data-sort-control],th>span>span[data-sort-control]')
      .forEach(span => span.setAttribute('data-sort-control', 'unsorted'))


    let sortDir, sortColumn
    switch (previousColumnState) {
    case 'unsorted':
      sortDir = 'ascending'
      sortColumn = sortBy
      break
    case 'ascending':
      sortDir = 'descending'
      sortColumn = sortBy
      break
    case 'descending':
      sortDir = 'unsorted'
      sortColumn = defaultSort
      break
    default:
      sortDir = 'unsorted'
      sortColumn = defaultSort
      break
    }

    headerRow.querySelectorAll('td,th').item(sortBy).querySelectorAll('span>span[data-sort-control]')[0].setAttribute('data-sort-control', sortDir)
    headerRow.querySelectorAll('td,th').item(sortBy).querySelectorAll(`span>span>span[data-ascending]`)[0].setAttribute('style', 'display: none ;')
    headerRow.querySelectorAll('td,th').item(sortBy).querySelectorAll(`span>span>span[data-descending]`)[0].setAttribute('style', 'display: none ;')
    headerRow.querySelectorAll('td,th').item(sortBy).querySelectorAll(`span>span>span[data-unsorted]`)[0].setAttribute('style', 'display: none ;')
    headerRow.querySelectorAll('td,th').item(sortBy).querySelectorAll(`span>span>span[data-${sortDir}]`)[0].setAttribute('style', 'display: ;')

    let rows, switching, i, x, y, shouldSwitch
    switching = true

    while (switching) {
      switching = false
      rows = table.querySelectorAll('tr')
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false
        x = rows[i].querySelectorAll('td')[sortColumn]
        y = rows[i + 1].querySelectorAll('td')[sortColumn]
        if ((sortDir === 'descending' || sortDir === 'unsorted') && (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase())) {
          shouldSwitch = true
          break
        }
        if ((sortDir === 'ascending') && (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase())) {
          shouldSwitch = true
          break
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
        switching = true
      }
    }
  }
}

customElements.define('power-table', PowerTable, { extends: 'table' })

