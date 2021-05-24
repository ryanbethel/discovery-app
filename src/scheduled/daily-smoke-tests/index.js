const arc = require("@architect/functions");
exports.handler = async function scheduled(event) {
    await arc.events.publish({
        name: "trigger-all-health-tests",
        payload: { trigger: "cron" },
    });
    return;
};
