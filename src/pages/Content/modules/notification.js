// Function to show toast
function showToast(message, duration = 5000) {
  const toastContainer =
    document.querySelector('.toast-container') || createToastContainer();

  // Nếu có toast chưa tắt, close nó trước khi hiển thị toast mới
  const existingToast = toastContainer.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create a new toast element
  const toast = document.createElement('div');
  toast.classList.add('toast');

  // Add content to toast
  toast.innerHTML = `
        <div class="toast-header">
          <strong class="me-auto">Thông Báo</strong>
          <button type="button" class="btn-close" aria-label="Close">&times;</button>
        </div>
        <div class="toast-body">${message}</div>
      `;

  // Style the toast (position and background)
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.zIndex = '9999';
  toast.style.backgroundColor = '#ee4d2d';
  toast.style.color = 'white';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  toast.style.padding = '10px';
  toast.style.marginTop = '10px';
  toast.style.transition = 'all 0.3s ease';

  // Append toast to container
  toastContainer.appendChild(toast);

  // Close the toast when the close button is clicked
  toast.querySelector('.btn-close').addEventListener('click', () => {
    toast.remove();
  });

  // Remove toast after the specified duration
  setTimeout(() => {
    toast.remove();
  }, duration);
}

// Create a container if it doesn't exist
function createToastContainer() {
  const container = document.createElement('div');
  container.classList.add('toast-container');
  document.body.appendChild(container);
  return container;
}

module.exports = { showToast };
