const arc = require('@architect/functions')

function page () {

  return {
    status: 200,
    html: /* html*/`
      <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="${arc.static('/css/tailwind.css')}" rel="stylesheet">
    <script type="module" src="${arc.static('/assets/power-table.js')}"></script>
    <title>Expanding list web component</title>
</head>
<body>
    <h1>Expanding list web component</h1>
      
    <label >my input</label>
    <input id="myInput" type="text"/>
      
<table is="power-table" data-search="myInput" data-default-sort-column="0">
    <thead>
        <tr>
            <td >One</td>
            <td >Two</td>
            <td >Three</td>
        </tr>
    </thead>
	<tbody>
		<tr>
			<td>1</td>
			<td>2</td>
			<td>3</td>
		</tr>
		<tr>
			<td>0</td>
			<td>9</td>
			<td>.</td>
		</tr>
		<tr>
			<td>4</td>
			<td>5</td>
			<td>6</td>
		</tr>
	</tbody>
</table>
  

</body>
</html>
`
  }
}

exports.handler = arc.http.async(page)
