/**
 * Gera uma mensagem padrão de WhatsApp para notificar o cliente que o pedido está pronto.
 * @param customerName O nome do cliente.
 * @param orderId O ID do pedido, usado para referência.
 * @returns Uma promessa que resolve para a mensagem formatada.
 */
export const generateWhatsAppMessage = async (customerName: string, orderId: string): Promise<string> => {
    // Mensagem padrão, simples e direta.
    const message = `Olá, ${customerName}! Seu pedido #${orderId.substring(0, 8).toUpperCase()} está pronto para retirada na Lavanderia Inteligente.`;
    
    // A função é mantida como `async` para manter a compatibilidade com o componente que a chama,
    // que espera uma Promise.
    return message;
};