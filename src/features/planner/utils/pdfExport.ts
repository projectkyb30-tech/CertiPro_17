import { jsPDF } from 'jspdf';
import { Note, DEFAULT_TAGS } from '../types';

export const exportNoteToPDF = (note: Note, courseTitle?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = 20;

  // Helper to add text and update Y position
  const addText = (text: string, size: number, style: 'normal' | 'bold' | 'italic' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const splitText = doc.splitTextToSize(text, contentWidth);
    doc.text(splitText, margin, yPosition);
    yPosition += (splitText.length * size * 0.4) + 5;
  };

  // Header
  doc.setFillColor(63, 81, 181); // Primary color approx
  doc.rect(0, 0, pageWidth, 15, 'F');
  
  // Title
  yPosition = 35;
  addText(note.title, 24, 'bold');

  // Metadata line
  const dateStr = new Date(note.updatedAt).toLocaleDateString('ro-RO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let metadata = `Data: ${dateStr}`;
  if (courseTitle) metadata += ` | Materie: ${courseTitle}`;
  
  addText(metadata, 10, 'normal', [100, 100, 100]);
  yPosition += 5;

  // Tags
  if (note.tags.length > 0) {
    const tagLabels = note.tags
      .map(tagId => DEFAULT_TAGS.find(t => t.id === tagId)?.label || tagId)
      .join(', ');
    addText(`Etichete: ${tagLabels}`, 10, 'italic', [80, 80, 80]);
  }
  
  yPosition += 10;
  
  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
  yPosition += 5;

  // Content
  addText(note.content, 12, 'normal', [0, 0, 0]);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generat cu CertiPro Exam Center - Pagina ${i} din ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.pdf`);
};
