import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import toast from 'react-hot-toast';

export const downloadReceiptAsPDF = async (element, donation) => {
  if (!element) {
    toast.error('रसीद रेंडर नहीं हो सकी।');
    return;
  }

  const toastId = toast.loading('रसीद PDF तैयार की जा रही है...');
  try {
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const renderHeight = (imgProps.height * (pdfWidth - 20)) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 10, 15, pdfWidth - 20, Math.min(renderHeight, pdfHeight - 30));

    const famCode = donation?.panchayat_family_id ? `FAM${donation.panchayat_family_id}` : 'KONDA';
    const cleanReceiptNo = (donation?.receipt_number || `REC-${Date.now().toString().slice(-4)}`).replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `Receipt-${famCode}-${cleanReceiptNo}.pdf`;

    pdf.save(fileName);
    toast.success(`रसीद डाउनलोड हो गई: ${fileName}`, { id: toastId });
  } catch (err) {
    console.error('PDF export failed:', err);
    toast.error('PDF डाउनलोड करने में विफल। प्रिंट विकल्प का उपयोग करें।', { id: toastId });
  }
};
