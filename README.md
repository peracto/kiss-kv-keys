# KISS-KV-KEYS

Creates a set of crypto keys from data stored in a Cloudflare Workers KV store.

```js
import kvKeys from 'kiss-kv-keys'
async function dosomerthing() {
    const keys = await kvKeys(KEYSTORE, name)
}
```
