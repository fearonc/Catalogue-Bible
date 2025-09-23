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

  // Background
  document.body.style.backgroundPosition = `calc(50% + ${xOffset}px) calc(50% + ${yOffset}px)`;

  // Catalogue title
  const title = document.querySelector('.catalogue-title');
  if (title) {
    title.style.transform = `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`;
  }

  // Logo
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




//function openTetris() {
//    document.getElementById("tetris-modal").style.display = "block";
//}
//
//function closeTetris() {
//    document.getElementById("tetris-modal").style.display = "none";
//}
//
//// When the bubble is clicked, open the game
//document.getElementById("tetris-bubble").addEventListener("click", openTetris);
//
//// Optional: Close if clicking outside modal
//window.addEventListener("click", function(event) {
//    let modal = document.getElementById("tetris-modal");
//    if (event.target === modal) {
//        modal.style.display = "none";
//    }
//});



// List of cursor images
const cursors = [
  'Aly.png',
  'Connor.png',
  'Katherine.png',
  'Mike.png',
  'George.png'
];

let cursorIndex = 0;

// Change cursor every 500ms
setInterval(() => {
  cursorIndex = (cursorIndex + 1) % cursors.length;
  document.body.style.cursor = `url(${cursors[cursorIndex]}) 0 0, auto`;

  // ⚡ force repaint hack
  body.style.pointerEvents = 'none';
  void body.offsetHeight; // trigger reflow
  body.style.pointerEvents = '';
}, 1000);


//Kickass game
(function () {
  let gameActive = false;

  function launchShooterGame() {
    if (document.getElementById("kickass-game-script")) {
      console.log("Shooter game already loaded.");
      return;
    }
    const s = document.createElement("script");
    s.src = "https://hi.kickassapp.com/kickass.js";
    s.id = "kickass-game-script";
    document.body.appendChild(s);
    gameActive = true;
    updateButton();
  }

  function stopShooterGame() {
    location.reload(); // reset the page
  }

  function toggleShooterGame() {
    if (gameActive) {
      stopShooterGame();
    } else {
      launchShooterGame();
    }
  }

  function updateButton() {
    const btn = document.getElementById("shooter-btn");
    if (!btn) return;
    btn.textContent = gameActive ? "Stop Shooter Game" : "Play Shooter Game";
  }

  // Expose globally
  window.toggleShooterGame = toggleShooterGame;
})();





