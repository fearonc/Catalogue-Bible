function addTask() {
  const input = document.getElementById('taskInput');
  const taskText = input.value.trim();
  if (taskText === '') return;

  const li = document.createElement('li');
  li.textContent = taskText;

  li.addEventListener('click', () => {
    li.classList.toggle('completed');
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✖';
  deleteBtn.style.marginLeft = '10px';
  deleteBtn.onclick = () => li.remove();

  li.appendChild(deleteBtn);
  document.getElementById('taskList').appendChild(li);
  input.value = '';
}

document.addEventListener('mousemove', function(e) {
  const xOffset = (e.clientX / window.innerWidth - 0.5) * 20;
  const yOffset = (e.clientY / window.innerHeight - 0.5) * 20;

  // Move background image
  document.body.style.backgroundPosition = `calc(50% + ${xOffset}px) calc(50% + ${yOffset}px)`;

  // Move "Catalogue" title
  const title = document.querySelector('.catalogue-title');
  if (title) {
    title.style.transform = `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`;
  }

  // Move logo
  const logo = document.querySelector('.catalogue-logo');
  if (logo) {
    logo.style.transform = `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`;
  }
});




    // FAQ toggle
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
          const answer = question.nextElementSibling;
          answer.style.display = (answer.style.display === 'block') ? 'none' : 'block';
        });
      });
    });

    function openFAQ() {
      document.getElementById('faqModal').style.display = 'block';
    }

    function closeFAQ() {
      document.getElementById('faqModal').style.display = 'none';
    }

    function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}


    // Close on outside click
    window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
};


// Page fade-in on load
window.addEventListener('load', () => {
  const fadeWrapper = document.querySelector('.fade-wrapper');
  if (fadeWrapper) {
    fadeWrapper.style.opacity = '1';
  }
});




function openTetris() {
    document.getElementById("tetris-modal").style.display = "block";
}

function closeTetris() {
    document.getElementById("tetris-modal").style.display = "none";
}

// When the bubble is clicked, open the game
document.getElementById("tetris-bubble").addEventListener("click", openTetris);

// Optional: Close if clicking outside modal
window.addEventListener("click", function(event) {
    let modal = document.getElementById("tetris-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});





