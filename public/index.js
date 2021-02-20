let phrases = document.querySelectorAll(".cta h1");
let cta = document.querySelector(".cta");
let length = phrases.length;
let animationCycle = 0;
cta.style.height = phrases[animationCycle].offsetHeight + "px";
phrases[animationCycle].style.top = 0;
animationCycle++;
window.onload = () => {
  let animation = setInterval(() => {
    cta.style.height = phrases[animationCycle].offsetHeight + "px";
    if (phrases[animationCycle - 1]) {
      phrases[animationCycle - 1].style.top = "-200%";
      phrases[animationCycle - 1].style.opacity = 0;
    }
    phrases[animationCycle].style.top = 0;
    animationCycle++;
    if (animationCycle === length) clearInterval(animation);
  }, 4000);
};
