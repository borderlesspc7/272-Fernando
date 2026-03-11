import jsPDF from "jspdf";
import type { Sale } from "../types/sales";
import type { Client } from "../types/clients";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("pt-BR").format(d);
};

const toDateValue = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === "object" && typeof value.toDate === "function")
    return value.toDate();
  return new Date(value);
};

export const pdfService = {
  /**
   * Gera uma proposta comercial simples em PDF para a venda
   * O arquivo é baixado automaticamente no navegador.
   */
  generateProposal(sale: Sale, client?: Client) {
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(18);
    doc.text("Proposta Comercial", 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Data: ${formatDate(toDateValue(sale.saleDate))}`, 14, y);
    y += 8;

    doc.text(`Proposta #${sale.id}`, 14, y);
    y += 10;

    // Dados do cliente
    doc.setFontSize(13);
    doc.text("Dados do Cliente", 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(`Nome: ${sale.clientName}`, 14, y);
    y += 6;

    if (client?.document) {
      doc.text(`Documento: ${client.document}`, 14, y);
      y += 6;
    }

    if (client?.phone) {
      doc.text(`Telefone: ${client.phone}`, 14, y);
      y += 6;
    }

    y += 4;

    // Dados do plano
    doc.setFontSize(13);
    doc.text("Plano Contratado", 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(`Nome: ${sale.plan.name}`, 14, y);
    y += 6;

    if (sale.plan.description) {
      const descriptionLines = doc.splitTextToSize(
        sale.plan.description,
        180
      );
      doc.text("Descrição:", 14, y);
      y += 6;
      doc.text(descriptionLines, 18, y);
      y += descriptionLines.length * 6;
    }

    doc.text(`Valor mensal: ${formatCurrency(sale.plan.value)}`, 14, y);
    y += 6;

    if (sale.payment.installationFee) {
      doc.text(
        `Taxa de instalação: ${formatCurrency(
          sale.payment.installationFee
        )}`,
        14,
        y
      );
      y += 6;
    }

    y += 4;

    // Equipamentos
    if (sale.equipments?.length) {
      doc.setFontSize(13);
      doc.text("Equipamentos", 14, y);
      y += 8;

      doc.setFontSize(11);
      sale.equipments.forEach((eq) => {
        doc.text(
          `- ${eq.name} (${eq.model || "s/ modelo"}) x${eq.quantity}`,
          14,
          y
        );
        y += 6;
      });
      y += 4;
    }

    // Resumo financeiro
    doc.setFontSize(13);
    doc.text("Resumo Financeiro", 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(
      `Valor total da venda: ${formatCurrency(
        sale.payment.totalValue
      )}`,
      14,
      y
    );
    y += 6;

    if (sale.payment.paymentMethod) {
      doc.text(
        `Forma de pagamento: ${sale.payment.paymentMethod}`,
        14,
        y
      );
      y += 6;
    }

    y += 10;

    doc.setFontSize(10);
    doc.text(
      "Esta proposta é válida por 7 dias a partir da data de emissão.",
      14,
      y
    );

    doc.save(`proposta-${sale.id}.pdf`);
  },

  /**
   * Gera um contrato simples em PDF para a venda
   */
  generateContract(sale: Sale, client?: Client) {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Contrato de Prestação de Serviço", 14, y);
    y += 12;

    doc.setFontSize(11);
    const intro = `
Entre as partes abaixo qualificadas:

Contratante: ${sale.clientName}${
      client?.document ? `, documento: ${client.document}` : ""
    }

Contratada: [NOME DA SUA EMPRESA], inscrita no CNPJ sob nº [CNPJ], doravante denominada simplesmente PRESTADORA.
`;
    const introLines = doc.splitTextToSize(intro.trim(), 180);
    doc.text(introLines, 14, y);
    y += introLines.length * 6 + 4;

    const clause1 = `
CLÁUSULA 1ª - DO OBJETO

O presente contrato tem como objeto a prestação de serviços de telecomunicações / internet / monitoramento, conforme plano abaixo:

Plano: ${sale.plan.name}
Valor mensal: ${formatCurrency(sale.plan.value)}
Valor da instalação: ${
      sale.payment.installationFee
        ? formatCurrency(sale.payment.installationFee)
        : "Isento/Conforme proposta"
    }.
`;
    const clause1Lines = doc.splitTextToSize(clause1.trim(), 180);
    doc.text(clause1Lines, 14, y);
    y += clause1Lines.length * 6 + 4;

    const clause2 = `
  CLÁUSULA 2ª - DO PRAZO

  O presente contrato terá início em ${formatDate(
      toDateValue(sale.activationDate ?? sale.saleDate ?? new Date())
    )} e vigorará por prazo indeterminado, podendo ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias.
  `;
    const clause2Lines = doc.splitTextToSize(clause2.trim(), 180);
    doc.text(clause2Lines, 14, y);
    y += clause2Lines.length * 6 + 4;

    const clause3 = `
CLÁUSULA 3ª - DO PAGAMENTO

O CONTRATANTE pagará à PRESTADORA o valor mensal de ${formatCurrency(
      sale.plan.value
    )}, com vencimento todo dia [DIA] de cada mês, através de [BOLETO / PIX / CARTÃO].
`;
    const clause3Lines = doc.splitTextToSize(clause3.trim(), 180);
    doc.text(clause3Lines, 14, y);
    y += clause3Lines.length * 6 + 4;

    const closing = `
E por estarem assim justas e contratadas, firmam o presente instrumento.

Local e data: ______________________________

___________________________________________
Assinatura do CONTRATANTE

___________________________________________
Assinatura da PRESTADORA
`;
    const closingLines = doc.splitTextToSize(closing.trim(), 180);
    doc.text(closingLines, 14, y);

    doc.save(`contrato-${sale.id}.pdf`);
  },
};

