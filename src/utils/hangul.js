// 한글 자음 모음을 분리하는 코드
// 출처 : https://github.com/idw111/hangul-disassemble
const Hangul = {
  alphabets: [
    [
      'ㄱ',
      'ㄲ',
      'ㄴ',
      'ㄷ',
      'ㄸ',
      'ㄹ',
      'ㅁ',
      'ㅂ',
      'ㅃ',
      'ㅅ',
      'ㅆ',
      'ㅇ',
      'ㅈ',
      'ㅉ',
      'ㅊ',
      'ㅋ',
      'ㅌ',
      'ㅍ',
      'ㅎ',
    ],
    [
      'ㅏ',
      'ㅐ',
      'ㅑ',
      'ㅒ',
      'ㅓ',
      'ㅔ',
      'ㅕ',
      'ㅖ',
      'ㅗ',
      'ㅘ',
      'ㅙ',
      'ㅚ',
      'ㅛ',
      'ㅜ',
      'ㅝ',
      'ㅞ',
      'ㅟ',
      'ㅠ',
      'ㅡ',
      'ㅢ',
      'ㅣ',
    ],
    [
      '',
      'ㄱ',
      'ㄲ',
      'ㄳ',
      'ㄴ',
      'ㄵ',
      'ㄶ',
      'ㄷ',
      'ㄹ',
      'ㄺ',
      'ㄻ',
      'ㄼ',
      'ㄽ',
      'ㄾ',
      'ㄿ',
      'ㅀ',
      'ㅁ',
      'ㅂ',
      'ㅄ',
      'ㅅ',
      'ㅆ',
      'ㅇ',
      'ㅈ',
      'ㅊ',
      'ㅋ',
      'ㅌ',
      'ㅍ',
      'ㅎ',
    ],
  ],

  disassemble(text, options) {
    options = options || {};
    const flatten = options.flatten || false;
    if (typeof text !== 'string') return null;
    if (text.length === 0) return '';
    return this._disassembleMultipleCharacters(text, flatten);
  },

  toString(text) {
    return this.disassemble(text, { flatten: true }).join('');
  },

  isHangul(text) {
    const hangul = this.disassemble(text.replace(/[a-zA-Z0-9 ]/g, ''));
    for (let i in hangul) {
      if (typeof hangul[i] === 'object') return true;
      if (this.isConsonant(hangul[i]) || this.isVowel(hangul[i])) return true;
    }
    return false;
  },

  equals(a, b) {
    if (a === b) return true;
    return this.toString(a) === this.toString(b);
  },

  isVowel(character) {
    if (!character) return false;
    for (let i in this.alphabets[1]) {
      if (character === this.alphabets[1][i]) return true;
    }
    return false;
  },

  isConsonant(character) {
    if (!character) return false;
    for (let i in this.alphabets[0]) {
      if (character === this.alphabets[0][i]) return true;
    }
    for (let j in this.alphabets[2]) {
      if (character === this.alphabets[2][j]) return true;
    }
    return false;
  },

  _disassembleSingleCharacter(singleCharacter, flatten) {
    let code = singleCharacter.charCodeAt(0);
    if (code === 32 || code === 39 || code === 44) return singleCharacter;
    if (this.isConsonant(singleCharacter) || this.isVowel(singleCharacter)) {
      if (flatten) return [singleCharacter];
      else return null;
    }
    if (code < 0xac00 || code > 0xd7a3) return singleCharacter;
    code = code - 0xac00;

    const last = code % 28;
    const vowel = ((code - last) / 28) % 21;
    const first = ((code - last) / 28 - vowel) / 21;
    const result = {
      first: this.alphabets[0][first],
      vowel: this.alphabets[1][vowel],
      last: this.alphabets[2][last],
    };

    if (!flatten) return result;

    const flat = [];
    if (result.first) flat.push(result.first);
    if (result.vowel) flat.push(result.vowel);
    if (result.last) flat.push(result.last);

    return flat;
  },

  _disassembleMultipleCharacters(multipleCharacters, flatten) {
    let result = [];
    for (let i = 0; i < multipleCharacters.length; i++) {
      const disassembled = this._disassembleSingleCharacter(
        multipleCharacters.charAt(i),
        flatten
      );
      if (flatten) result = result.concat(disassembled);
      else result.push(disassembled);
    }
    return result;
  },
};

export { Hangul };
