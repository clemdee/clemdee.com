

const element = document.querySelector('section');
const animationControls = cipherAnimate({ element, steps: { in: 0 } });

element.addEventListener('mouseenter', async event => {
  const { abort } = cipherAnimate({ element, steps: { fill: Infinity } });
  const abortHandler = async event => {
    element.removeEventListener('mouseleave', abortHandler);
    await abort();
  };
  element.addEventListener('mouseleave', abortHandler);
});


