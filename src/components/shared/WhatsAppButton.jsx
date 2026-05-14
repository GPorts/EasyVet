import { MessageCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function WhatsAppButton({ 
  href, 
  label = 'WhatsApp', 
  size = 'sm',
  className = '' 
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <Button variant="whatsapp" size={size} icon={MessageCircle}>
        {label}
      </Button>
    </a>
  );
}
