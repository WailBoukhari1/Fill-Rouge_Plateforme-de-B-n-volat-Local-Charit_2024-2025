document.addEventListener('DOMContentLoaded', function() {
  const shareButton = document.querySelector('.share-button');
  const shareModal = document.querySelector('.share-modal');
  
  if (shareButton && shareModal) {
    shareButton.addEventListener('click', function() {
      shareModal.classList.remove('hidden');
    });

    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
      if (!shareModal.contains(event.target) && !shareButton.contains(event.target)) {
        shareModal.classList.add('hidden');
      }
    });
  }
}); 