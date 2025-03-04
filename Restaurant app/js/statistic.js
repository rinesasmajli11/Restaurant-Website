function animateValue(element, start, end, duration) {
  let startTime = null;

  const step = (timestamp) => {
    if (!startTime) {
      startTime = timestamp;
    }

    const progress = timestamp - startTime;
    const currentValue = Math.min(
      Math.floor((progress / duration) * (end - start) + start),
      end
    );

    element.textContent = currentValue;

    if (currentValue < end) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

function initObserver() {
  const options = {
    root: null,
    threshold: 0.7,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const statValues = entry.target.querySelectorAll(".stat-value");
        statValues.forEach((value) => {
          const endValue = parseInt(value.getAttribute("data-target"), 10);
          animateValue(value, 0, endValue, 3000);
        });
        observer.unobserve(entry.target);
      }
    });
  }, options);

  const targetSection = document.querySelector(".statistics-section");
  if (targetSection) {
    observer.observe(targetSection);
  }
}

document.addEventListener("DOMContentLoaded", initObserver);
