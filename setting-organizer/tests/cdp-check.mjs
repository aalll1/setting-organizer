const websocketUrl = process.argv[2];
const expression = process.argv[3];

if (!websocketUrl || !expression) {
    console.error('Usage: node cdp-check.mjs <websocket-url> <expression>');
    process.exit(1);
}

const client = new WebSocket(websocketUrl);

client.addEventListener('open', () => {
    client.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
            expression,
            returnByValue: true,
            awaitPromise: true,
        },
    }));
});

client.addEventListener('message', (event) => {
    console.log(event.data);
    client.close();
    process.exit(0);
});

client.addEventListener('error', (event) => {
    console.error(event);
    process.exit(1);
});
