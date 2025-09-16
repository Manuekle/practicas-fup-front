// Swal.fire({
//     icon: "error",
//     title: "Oops...",
//     text: "Something went wrong!",
//     footer: '<a href="#">Why do I have this issue?</a>'
//   });
import Swal from 'sweetalert2';

const showAlert = (title, text, icon = 'info') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'Aceptar',
  });
};

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  showClass: {
    popup: "swal2-fade-in",
  },
  hideClass: {
    popup: "swal2-fade-out",
  },
});

const showSuccess = (text) => {
  return showAlert('Éxito', text, 'success');
};

const showError = (title, text) => {
  return showAlert(title, text, 'error');
};

const showWarning = (text) => {
  return showAlert('Advertencia', text, 'warning');
};

const showConfirm = (title, text, confirmButtonText = 'Sí, confirmar', cancelButtonText = 'Cancelar') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
  });
};

export const toastSuccess = (message) => {
  Toast.fire({ icon: "success", title: message });
};

export const toastError = (message) => {
  Toast.fire({ icon: "error", title: message });
};

export const toastWarning = (message) => {
  Toast.fire({ icon: "warning", title: message });
};

export const toastInfo = (message) => {
  Toast.fire({ icon: "info", title: message });
};

export { showAlert, showSuccess, showError, showWarning, showConfirm };
