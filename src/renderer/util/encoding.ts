import jschardet from 'jschardet';

export const UTF8_with_bom = 'utf8bom';
export const UTF16be = 'utf16be';
export const UTF16le = 'utf16le';

export const UTF16be_BOM = [0xFE, 0xFF];
export const UTF16le_BOM = [0xFF, 0xFE];
export const UTF8_BOM = [0xEF, 0xBB, 0xBF];

const ZERO_BYTE_DETECTION_BUFFER_MAX_LEN = 512;   // number of bytes to look at to decide about a file being binary or not
const NO_ENCODING_GUESS_MIN_BYTES = 512;       // when not auto guessing the encoding, small number of bytes are enough
const AUTO_ENCODING_GUESS_MIN_BYTES = 512 * 8;     // with auto guessing we want a lot more content to be read for guessing
export const AUTO_ENCODING_GUESS_MAX_BYTES = 512 * 128;   // set an upper limit for the number of bytes we pass on to jschardet

export async function guessEncodingByBuffer(buffer: Buffer): Promise<string | null> {
  // ensure to limit buffer for guessing due to https://github.com/aadsm/jschardet/issues/53
  const limitedBuffer = buffer.slice(0, AUTO_ENCODING_GUESS_MAX_BYTES);

  // before guessing jschardet calls toString('binary') on input if it is a Buffer,
  // since we are using it inside browser environment as well we do conversion ourselves
  // https://github.com/aadsm/jschardet/blob/v2.1.1/src/index.js#L36-L40
  const binaryString = encodeLatin1(limitedBuffer);

  // const binaryString = bufferToHexString(limitedBuffer); // wrong try
  // const binaryString = limitedBuffer.toString('binary'); // maybe buffer toString('binary') is different in browser environment with node

  const guessed = jschardet.detect(binaryString);
  if(!guessed || !guessed.encoding) {
    return null;
  }

  console.log('guessed =', guessed);
  // return guessed;

  return toIconvLiteEncoding(guessed.encoding);
}

const JSCHARDET_TO_ICONV_ENCODINGS: { [name: string]: string } = {
  'ibm866': 'cp866',
  'big5': 'cp950'
};

export function toIconvLiteEncoding(encodingName: string): string {
  const normalizedEncodingName = encodingName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const mapped = JSCHARDET_TO_ICONV_ENCODINGS[normalizedEncodingName];
  return mapped || normalizedEncodingName;
}

function encodeLatin1(buffer: /* Uint8Array *//* ArrayBufferLike */Buffer): string {
  let result = '';
  for(let i = 0; i < buffer.byteLength/* length */; i++) {
    result += String.fromCharCode(buffer[i]);
  }
  return result;
}

export function detectEncodingByBOMFromBuffer(buffer: Buffer | null, bytesRead: number): typeof UTF8_with_bom | typeof UTF16le | typeof UTF16be | null {
  if(!buffer || bytesRead < UTF16be_BOM.length) {
    return null;
  }

  const b0 = buffer[0]; //.readUint8(0);
  const b1 = buffer[1]; //.readUInt8(1);

  // UTF-16 BE
  if(b0 === UTF16be_BOM[0] && b1 === UTF16be_BOM[1]) {
    return UTF16be;
  }

  // UTF-16 LE
  if(b0 === UTF16le_BOM[0] && b1 === UTF16le_BOM[1]) {
    return UTF16le;
  }

  if(bytesRead < UTF8_BOM.length) {
    return null;
  }

  const b2 = buffer[2]; //.readUInt8(2);

  // UTF-8
  if(b0 === UTF8_BOM[0] && b1 === UTF8_BOM[1] && b2 === UTF8_BOM[2]) {
    return UTF8_with_bom;
  }

  return null;
}

export interface DetectedEncodingResult {
  encoding: string | null;
  seemsBinary: boolean;
}

export interface ReadResult {
  buffer: Buffer | null;
  bytesRead: number;
}

export function detectEncodingFromBuffer({ buffer, bytesRead }: ReadResult, autoGuessEncoding?: boolean): Promise<DetectedEncodingResult> | DetectedEncodingResult {

  // Always first check for BOM to find out about encoding
  let encoding = detectEncodingByBOMFromBuffer(buffer, bytesRead);

  // Detect 0 bytes to see if file is binary or UTF-16 LE/BE
  // unless we already know that this file has a UTF-16 encoding
  let seemsBinary = false;
  if(encoding !== UTF16be && encoding !== UTF16le && buffer) {
    let couldBeUTF16LE = true; // e.g. 0xAA 0x00
    let couldBeUTF16BE = true; // e.g. 0x00 0xAA
    let containsZeroByte = false;

    // This is a simplified guess to detect UTF-16 BE or LE by just checking if
    // the first 512 bytes have the 0-byte at a specific location. For UTF-16 LE
    // this would be the odd byte index and for UTF-16 BE the even one.
    // Note: this can produce false positives (a binary file that uses a 2-byte
    // encoding of the same format as UTF-16) and false negatives (a UTF-16 file
    // that is using 4 bytes to encode a character).
    for(let i = 0; i < bytesRead && i < ZERO_BYTE_DETECTION_BUFFER_MAX_LEN; i++) {
      const isEndian = (i % 2 === 1); // assume 2-byte sequences typical for UTF-16
      const isZeroByte = (buffer[i]/* .readUInt8(i) */ === 0);

      if(isZeroByte) {
        containsZeroByte = true;
      }

      // UTF-16 LE: expect e.g. 0xAA 0x00
      if(couldBeUTF16LE && (isEndian && !isZeroByte || !isEndian && isZeroByte)) {
        couldBeUTF16LE = false;
      }

      // UTF-16 BE: expect e.g. 0x00 0xAA
      if(couldBeUTF16BE && (isEndian && isZeroByte || !isEndian && !isZeroByte)) {
        couldBeUTF16BE = false;
      }

      // Return if this is neither UTF16-LE nor UTF16-BE and thus treat as binary
      if(isZeroByte && !couldBeUTF16LE && !couldBeUTF16BE) {
        break;
      }
    }

    // Handle case of 0-byte included
    if(containsZeroByte) {
      if(couldBeUTF16LE) {
        encoding = UTF16le;
      } else if(couldBeUTF16BE) {
        encoding = UTF16be;
      } else {
        seemsBinary = true;
      }
    }
  }

  // Auto guess encoding if configured
  if(autoGuessEncoding && !seemsBinary && !encoding && buffer) {
    return guessEncodingByBuffer(buffer.slice(0, bytesRead)).then(guessedEncoding => {
      return {
        seemsBinary: false,
        encoding: guessedEncoding
      };
    });
  }

  return { seemsBinary, encoding };
}

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