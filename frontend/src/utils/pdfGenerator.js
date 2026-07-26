import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generateInvoice = (payment, student) => {
  const doc = new jsPDF();
  
  // Set font (we'd ideally need a Unicode font for Vietnamese, but jsPDF standard fonts lack full VN support. 
  // For a basic version, we can use built-in fonts and strip accents or just use English terms if it breaks,
  // but let's try standard text first).
  
  doc.setFontSize(22);
  doc.text('BIEN LAI THU TIEN HOC PHI', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Trung tam Giao duc: NT', 14, 40);
  doc.text(`Ngay in: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 48);
  
  doc.text(`Hoc sinh: ${student?.full_name || 'Khach hang'}`, 14, 65);
  doc.text(`Lop: ${student?.class_name || student?.classes?.class_name || 'N/A'}`, 14, 73);
  doc.text(`So dien thoai: ${student?.phone_number || 'N/A'}`, 14, 81);
  
  const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount);
  
  doc.autoTable({
    startY: 95,
    head: [['Khoan thu', 'Hinh thuc', 'Ngay thu', 'So tien']],
    body: [
      [
        payment.tuition_fees?.title || 'Hoc phi', 
        payment.payment_method === 'cash' ? 'Tien mat' : (payment.payment_method === 'vietqr' ? 'Chuyen khoan' : payment.payment_method), 
        payment.paid_at ? format(new Date(payment.paid_at), 'dd/MM/yyyy') : '', 
        formattedAmount
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  });
  
  const finalY = doc.lastAutoTable.finalY || 130;
  
  doc.text(`Tong cong: ${formattedAmount}`, 140, finalY + 15);
  
  doc.text('Nguoi thu tien', 150, finalY + 40, { align: 'center' });
  doc.text('(Ky & ghi ro ho ten)', 150, finalY + 48, { align: 'center' });
  
  doc.save(`Bien_Lai_${student?.full_name || 'Hoc_Phi'}.pdf`);

  };
