export const SUPPORTED_ENCODINGS: {
  [encoding: string]: {
    labelLong: string;
    labelShort: string;
    order: number;
    encodeOnly?: boolean;
    alias?: string
  }
} = {
  utf8: {
    labelLong: 'UTF-8',
    labelShort: 'UTF-8',
    order: 1,
    alias: 'utf8bom'
  },
  euckr: {
    labelLong: 'Korean (EUC-KR)',
    labelShort: 'EUC-KR',
    order: 40
  },
}