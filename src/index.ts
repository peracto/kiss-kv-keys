export default (kvstore: KVNamespace, key: string) => kvstore.get<KvKeyDefinition>(key, 'json').then(mapKeys)

declare type KvAlgorithm =
    AlgorithmIdentifier
    | RsaHashedImportParams
    | EcKeyImportParams
    | HmacImportParams
    | DhImportKeyParams
    | AesKeyAlgorithm

interface KvKey {
    name: string,
    format: "raw" | "pkcs8" | "spki",
    key: string,
    usage: string,
    meta?: { [key: string]: any }
}

interface KvKeyDefinition {
    algorithm: KvAlgorithm,
    encoding: BufferEncoding,
    meta?: { [key: string]: any },
    keys: KvKey[]
}

const mapKeys = async (t: KvKeyDefinition | null) => {
    if (!t) throw new Error('cannot load key from kvstore')
    return Object.assign(
        await buildKeys(t.keys, t.algorithm, t.encoding || 'base64', createKey),
        typeof t.meta === 'object' ? t.meta : undefined
    )
}

const buildKeys = async (arr: KvKey[], algorithm: KvAlgorithm, encoding: BufferEncoding, cb: typeof createKey) => {
    const entries = []
    for (const key of arr) {
        entries.push([
            key.name,
            Object.assign(
                {
                    key: await cb(algorithm, key, encoding),
                    algorithm: algorithm
                },
                typeof key.meta === 'object' ? key.meta : undefined
            )
        ])
    }
    return Object.fromEntries(entries)
}

const createKey = (algorithm: KvAlgorithm, key: KvKey, encoding: BufferEncoding) => crypto.subtle.importKey(
    key.format,
    Buffer.from(key.key, encoding),
    algorithm,
    false,
    key.usage.split(',').map(s => s.trim() as KeyUsage)
)

