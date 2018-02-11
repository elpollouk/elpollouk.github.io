Chicken.register("ConfigParser", ["Config"], (Config) => {
    "use strict";

    function parseKeyValue(text) {
        var kv = text.split('=');
        return {
            key: decodeURIComponent(kv[0] || '').split('.'),
            value: decodeURIComponent(kv[1] || '')
        };
    }

    function applyToConfig(kv, root) {
        if (!(kv.key[0] in root)) return;

        var key = kv.key.shift();
        if (kv.key.length !== 0)
            return applyToConfig(kv, root[key]);

        switch (typeof root[key]) {
            case 'boolean':
                root[key] = kv.value.toLocaleLowerCase() === 'true';
                break;

            case 'number':
                root[key] = Number.parseFloat(kv.value);
                break;

            case 'string':
                root[key] = kv.value;
        }
    }

    return function () {
        var query = window.location.href.split('?');
        if (query.length === 1) return;

        query = query[1].split('&');
        for (var i = 0; i < query.length; i++) {
            var kv = parseKeyValue(query[i]);
            applyToConfig(kv, Config);
        }
    }
});