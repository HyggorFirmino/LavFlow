export const maskCpf = (cpf: string): string => {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
};

export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  phone = phone.replace(/\D/g, '');
  if (phone.length !== 11) return phone;
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) *****-$4');
};

export const maskVisibleCpf = (cpf: string): string => {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const maskVisiblePhone = (phone: string): string => {
  if (!phone) return '';
  phone = phone.replace(/\D/g, '');
  if (phone.length !== 11) return phone;
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const getTrackingUrl = (cardId: string): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  let origin = '';
  
  if (typeof window !== 'undefined') {
    origin = window.location.origin;
  }
  
  // Se a API estiver rodando em IP local, o frontend também estará no mesmo IP local na porta 3000
  if (apiUrl && (apiUrl.includes('192.168') || apiUrl.includes('10.') || apiUrl.includes('172.'))) {
    try {
      const url = new URL(apiUrl);
      origin = `http://${url.hostname}:3000`;
    } catch (e) {}
  }
  
  return `${origin}/lavflow/rastreio?id=${cardId}`;
};
