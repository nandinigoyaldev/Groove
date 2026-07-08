const button = document.querySelector(".intro-appear");
const intro = document.querySelector(".intro");
const header = document.querySelector("header");
const footer = document.querySelector("footer");
// for work
const button2 = document.querySelector(".work-appear");
const work = document.querySelector(".work");

// for about
const button3 = document.querySelector(".about-appear");
const about = document.querySelector(".about");
// for hide button
const hideButton = document.querySelector(".hide-intro-button");
const hideButton2 = document.querySelector(".hide-work-button");
const hideButton3 = document.querySelector(".hide-about-button");

button.addEventListener("click", function () {
  header.classList.add("hide");
  footer.classList.add("hide");

  setTimeout(() => {
    header.classList.add("none");
    footer.classList.add("none");

    intro.classList.remove("none");
    intro.classList.add("show"); // Just use show, no sticky-intro needed
  }, 500);
});

hideButton.addEventListener("click", function () {
  intro.classList.remove("show");
  intro.classList.add("hide");
  header.classList.remove("hide");
  header.classList.remove("none");
  footer.classList.remove("hide");
  footer.classList.remove("none");

  setTimeout(() => {
    intro.classList.remove("hide");
    intro.classList.add("none");
    header.classList.add("show");
    footer.classList.add("show");
  }, 500);
});

button2.addEventListener("click", function () {
  header.classList.add("hide");
  footer.classList.add("hide");

  setTimeout(() => {
    header.classList.add("none");
    footer.classList.add("none");

    work.classList.remove("none");
    work.classList.add("show"); // Just use show, no sticky-intro needed
  }, 500);
});

button3.addEventListener("click", function () {
  header.classList.add("hide");
  footer.classList.add("hide");

  setTimeout(() => {
    header.classList.add("none");
    footer.classList.add("none");

    about.classList.remove("none");
    about.classList.add("show"); // Just use show, no sticky-intro needed
  }, 500);
});
