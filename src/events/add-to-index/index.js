const arc = require("@architect/functions");
const { DB_MAP } = require("@architect/shared/db-map.js");
exports.handler = async function subscribe(event) {
    const message = event.Records[0].Sns.Message;
    const item = message ? JSON.parse(message).item : [];
    if (item) {
        const data = await arc.tables();
        const indexMeta = await data.searchindextable.query(DB_MAP.INDEX_META.queryLatestIndex());
        //add new item to end of temporary index
        if (indexMeta.Items[0].sk.slice(2)) {
            await data.searchindextable.update({
                Key: { pk: "#IDX_META", sk: "I#" + indexMeta.Items[0].sk.slice(2) },
                UpdateExpression: "set idx = :newidx",
                ExpressionAttributeValues: {
                    ":newidx": indexMeta.Items[0].idx === [] ? [item] : [...indexMeta.Items[0].idx, item],
                },
            });
        }

        //trigger a reindex when the temporary chunk is half full
        if (indexMeta.Items[0].idx.length > 250) {
            await arc.events.publish({
                name: "reindex-acronyms",
                payload: { trigger: "temporary index half full" },
            });
        }
    }
    return;
};
