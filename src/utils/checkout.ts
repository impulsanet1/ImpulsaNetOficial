export const sendToWhatsApp = (whatsappNumber: string, message: string) => {
  const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
