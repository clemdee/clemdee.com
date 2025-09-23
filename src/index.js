

const element = document.querySelector('.title');
const animationControls = cipherAnimate({ element, steps: { in: 0, out: 20 } });

element.addEventListener('mouseenter', async event => {
  const { abort } = cipherAnimate({ element, steps: { fill: Infinity } });
  const abortHandler = async event => {
    element.removeEventListener('mouseleave', abortHandler);
    await abort();
  };
  element.addEventListener('mouseleave', abortHandler);
});


