const { PrismaClient } = require("@prisma/client");
const tiny = require("tiny-json-http");

const prisma = new PrismaClient();

async function getAllRepos() {
    let repos = await tiny.get({ url: "https://api.github.com/orgs/begin-examples/repos", data: { "per-page": 100 } });
    return repos;
}
async function getReadme({ name, login }) {
    let readme = await tiny.get({ url: `https://api.github.com/repos/${login}/${name}/readme` });
    return readme;
}

async function main() {
    const allDbRepos = await prisma.repo.findMany({
        include: { readme: true },
    });
    console.log(allDbRepos[5]);
    const allRepos = await getAllRepos();
    const newRepos = allRepos.body.filter((repo) => !allDbRepos.find((item) => item.id === repo.id));
    const updatedRepos = allRepos.body.filter((repo) => {
        const index = allDbRepos.findIndex((item) => item.id === repo.id);

        if (index !== -1) {
            const hasReadme = allDbRepos[index].readme ? true : false;
            const dbDate = new Date(allDbRepos[index].updated_at);
            const newDate = new Date(repo.updated_at);
            const dateChanged = newDate > dbDate;
            return dateChanged || !hasReadme;
        } else {
            return false;
        }
    });
    const updatedWithReadmes = await Promise.all(
        updatedRepos.map((repo) =>
            getReadme({ name: repo.name, login: "begin-examples" }).then((readme) => {
                const output = repo;
                const content = Buffer.from(readme.body.content, "base64").toString();
                const sha = readme.body.sha;
                output.readme = { content, sha };
                return output;
            })
        )
    );
    const newWithReadmes = await Promise.all(
        newRepos.map((repo) =>
            getReadme({ name: repo.name, login: "begin-examples" }).then((readme) => {
                const output = repo;
                const content = Buffer.from(readme.body.content, "base64").toString();
                const sha = readme.body.sha;
                output.readme = { content, sha };
                return output;
            })
        )
    );
    const newDb = newWithReadmes.map(
        async ({ id, name, node_id, created_at, updated_at, pushed_at, readme }) =>
            await prisma.repo.create({
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
    );
    const updatedDb = updatedWithReadmes.map(
        async ({ id, name, node_id, created_at, updated_at, pushed_at, readme }) =>
            await prisma.repo.update({
                where: { id },
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
    );
    const out = await Promise.all([...newDb, ...updatedDb]);

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
    //console.dir(deltaRepoArray);
    // use `console.dir` to print nested objects
    //console.dir(allUsers, { depth: null });
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
