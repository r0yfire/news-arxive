import {Tiktoken, getEncoding} from 'js-tiktoken'

const getTokenizer = (): Tiktoken => {
    return getEncoding('cl100k_base')
}

const enc = getTokenizer()

export function countTokens(text: string): number {
    const encoded = enc.encode(text, 'all')
    return encoded.length
}
