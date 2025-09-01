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
