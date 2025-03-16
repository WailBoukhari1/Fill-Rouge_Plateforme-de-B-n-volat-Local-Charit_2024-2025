document.addEventListener('DOMContentLoaded', function() {
  const shareButton = document.querySelector('.share-button');
  const shareModal = document.querySelector('.share-modal');
  const closeButton = document.querySelector('.close-share-modal');

  if (shareButton && shareModal && closeButton) {
    shareButton.addEventListener('click', function() {
      shareModal.classList.remove('hidden');
    });

    closeButton.addEventListener('click', function() {
      shareModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    shareModal.addEventListener('click', function(e) {
      if (e.target === shareModal) {
        shareModal.classList.add('hidden');
      }
    });
  }
}); 