const arc = require("@architect/functions");
const githubOAuthUrl = require("./githubOAuthUrl");

async function login(req) {
    let finalRedirect = "/";
    if (req.query.next === "admin") {
        finalRedirect = "/admin";
    }
    const githubUrl = githubOAuthUrl({ finalRedirect });
    return {
        status: 200,
        html: /*html*/ `<!doctype html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>login page</title>
                </head>
                <body>
                    <h1>Login</h1>
                    </br>
                    <a href="${githubUrl}">Login with Github</a>
                    </br>
                </body>
            </html>`,
    };
}

exports.handler = arc.http.async(login);
