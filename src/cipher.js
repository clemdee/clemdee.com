
/* Utility functions */

const randomInt = (from, to) => {
  if (to < from) {
    [from, to] = [to, from];
  }
  if (from === Infinity) return Infinity;
  if (to === -Infinity) return -Infinity;
  return Math.floor(from + Math.random() * (to - from));
};

const isBetween = (number, min, max) => min <= number && number < max;
const wait = ms => new Promise (resolve => setTimeout(resolve, ms));

const isRandomisable = (char) => isBetween(char.codePointAt(0), 33, 127);
const randomCipheredChar = () => String.fromCharCode(randomInt(33, 127));

const maybeRandomCipheredChar = (char) => isRandomisable(char)
  ? randomCipheredChar()
  : char;

/* Cihper functions */

async function* cipheredTextGenerator ({ text, options }) {
  const finalChars = Array.from(text.to);
  const chars = Array.from(text.from);
  const charsStepCount = Array.from(
    { length: chars.length },
    () => ({
      in: randomInt(0, options.steps.in),
      fill: options.steps.fill,
      out: randomInt(0, options.steps.out),
    })
  );
  const maxStepCount = {
    in: Math.max(...charsStepCount.map(steps => steps.in)),
    fill: options.steps.fill,
    out: Math.max(...charsStepCount.map(steps => steps.out)),
  };
  // in
  for (let i = 0; i < maxStepCount.in; i++) {
    if (options.stopped) return;
    chars.forEach((char, index) => {
      if (i >= charsStepCount[index].in) {
        chars[index] = maybeRandomCipheredChar(char);
      }
    });
    await wait(options.duration);
    yield chars.join('');
  }
  // fill
  for (let i = 0; i < maxStepCount.fill; i++) {
    if (options.aborted) break;
    if (options.stopped) return;
    chars.forEach((char, index) => {
      chars[index] = maybeRandomCipheredChar(char);
    });
    await wait(options.duration);
    yield chars.join('');
  }
  // out
  for (let i = 0; i < maxStepCount.out; i++) {
    if (options.stopped) return;
    chars.forEach((char, index) => {
      if (i < charsStepCount[index].out - 1) {
        chars[index] = maybeRandomCipheredChar(char);
      } else {
        chars[index] = finalChars[index];
      }
    });
    await wait(options.duration);
    yield chars.join('');
  }
}

const cipherAnimateRecursive = async ({
  element,
  text,
  options = {},
} = {}) => {
  if (element.childElementCount === 0) {
    element['data-text'] ??= element.innerText;
    text = {
      from: element.innerText,
      to: text ?? element['data-text'],
    };
    for await (const cipheredText of cipheredTextGenerator({ text, options })) {
      element.innerText = cipheredText;
    }
  } else {
    await Promise.all(
      [...element.children].map(
        element => cipherAnimateRecursive({ element, options })
      )
    )
  }
};

const cipherAnimate = ({
  element,
  text,
  ...options
} = {}) => {
  text ??= element.innerText;
  options.steps = Object.assign({},
    { in: 10, fill: 5, out: 20 },
    options.steps,
  );
  options.duration ??= 50;
  options.aborted = false;
  const done = cipherAnimateRecursive({ element, text, options });
  return {
    done,
    abort: async resolve => {
      options.aborted = true,
      await done;
    },
  };
};

