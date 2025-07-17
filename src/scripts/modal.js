document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.querySelector("dialog");

  if (!dialog) return;

  setTimeout(() => {
    dialog.showModal();
  }, 1200);

  dialog.addEventListener("click", (event) => {
    const isBackdropClick = event.target === dialog;
    if (isBackdropClick) {
      dialog.close();
    }
  });
});
