/**
 * Normalize phone number to international format (55 + DDD + number)
 */
function normalizePhone(phone) {
  let cleaned = phone.replace(/\D/g, '');
  // If starts with +55, remove
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return cleaned;
  }
  // Add country code
  return '55' + cleaned;
}

/**
 * Generate WhatsApp link for appointment confirmation
 */
export function generateConfirmationLink(phone, petName, date, time, clinicName) {
  const normalizedPhone = normalizePhone(phone);
  const message = `Olá! 🐾\n\nSua consulta na *${clinicName}* está confirmada!\n\n📋 *Detalhes:*\n🐶 Pet: ${petName}\n📅 Data: ${date}\n🕐 Horário: ${time}\n\nCaso precise reagendar, entre em contato conosco.\n\nAté lá! 💚`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`;
}

/**
 * Generate WhatsApp link for vaccine reminder
 */
export function generateVaccineReminderLink(phone, petName, vaccineName, date, clinicName) {
  const normalizedPhone = normalizePhone(phone);
  const message = `Olá! 🐾\n\nLembrete de vacina da *${clinicName}*!\n\n💉 *Vacina:* ${vaccineName}\n🐶 *Pet:* ${petName}\n📅 *Data prevista:* ${date}\n\nEntre em contato para agendar o reforço.\n\nCuidar é amar! 💚`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`;
}

/**
 * Generate generic WhatsApp link
 */
export function generateWhatsAppLink(phone, message) {
  const normalizedPhone = normalizePhone(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`;
}
