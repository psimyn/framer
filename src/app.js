import Framer from './Framer.html';

let target
try {
  const images = document.querySelector('.images')
  const main = images.parentNode

  target = document.createElement('div')
  main.insertBefore(target, images)
} catch(e) {
  target = document.querySelector('.framerapp') 
}
window.Framer = new Framer({
	target
});
