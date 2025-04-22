// Add some randomization to the eye movement
const pupil = document.querySelector('.pupil');

function randomEyeMovement() {
  const randomX = Math.random() * 10 - 5;
  const randomY = Math.random() * 10 - 5;
  
  pupil.style.transform = `translate(${randomX}px, ${randomY}px)`;
  
  setTimeout(randomEyeMovement, Math.random() * 2000 + 1000);
}

randomEyeMovement();