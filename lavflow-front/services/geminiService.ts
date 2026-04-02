/**
 * Gera uma mensagem padrão de WhatsApp para notificar o cliente que o pedido está pronto.
 * @param customerName O nome do cliente.
 * @param orderId O ID do pedido, usado para referência.
 * @param storeName O nome da loja (opcional).
 * @returns Uma promessa que resolve para a mensagem formatada.
 */
export const generateWhatsAppMessage = async (customerName: string, orderId: string, storeName?: string): Promise<string> => {
    // Mensagem padrão, simples e direta.
    let message = `Olá, ${customerName}! Seu pedido está pronto para retirada.`;
    
    if (storeName) {
        message += `\n\nAtt, ${storeName}`;
    } else {
        message += `\n\nAtt, Lavanderia`;
    }
    
    // A função é mantida como `async` para manter a compatibilidade com o componente que a chama,
    // que espera uma Promise.
    return message;
};