import { MeetingNotes } from '../types';
import { Language } from '../constants';
import { getTranslator } from '../utils/translations';

// jsPDF is loaded from a CDN in index.html, so we declare it on the window object for TypeScript
declare global {
  interface Window {
    jspdf: any;
  }
}

export const generatePdf = (notes: MeetingNotes, language: Language) => {
  const t = getTranslator(language);
  // Access jsPDF through the window object to ensure we're getting the global.
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 15;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const lineHeight = 7;
  const maxWidth = doc.internal.pageSize.width - margin * 2;

  const addPageIfNeeded = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  const splitTitle = doc.splitTextToSize(notes.title, maxWidth);
  doc.text(splitTitle, doc.internal.pageSize.width / 2, y, { align: 'center' });
  y += splitTitle.length * lineHeight + 2;

  // Date
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(150); // a gray color
  doc.text(notes.date, doc.internal.pageSize.width / 2, y, { align: 'center' });
  y += 20;
  doc.setTextColor(0); // reset color to black
  
  // Summary
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(t('Key Summary'), margin, y);
  y += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  notes.summary.forEach(point => {
    const splitText = doc.splitTextToSize(`• ${point}`, maxWidth);
    addPageIfNeeded(splitText.length * lineHeight);
    doc.text(splitText, margin + 5, y);
    y += splitText.length * lineHeight;
  });
  y += 10;

  // Action Items
  addPageIfNeeded(20);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(t('Action Items'), margin, y);
  y += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  const groupedTasks = notes.tasks.reduce((acc, task) => {
    (acc[task.team] = acc[task.team] || []).push(task);
    return acc;
  }, {} as Record<string, typeof notes.tasks>);

  Object.entries(groupedTasks).forEach(([team, tasks]) => {
    addPageIfNeeded(lineHeight + 5);
    doc.setFont(undefined, 'bold');
    doc.text(team, margin, y);
    y += lineHeight;

    doc.setFont(undefined, 'normal');
    tasks.forEach(task => {
        const splitText = doc.splitTextToSize(`- ${task.action}`, maxWidth - 5);
        addPageIfNeeded(splitText.length * lineHeight);
        doc.text(splitText, margin + 5, y);
        y += splitText.length * lineHeight;
    });
    y += 5; // Extra space between teams
  });
  y += 10;
  
  // Transcript
  addPageIfNeeded(20);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(t('Full Transcript'), margin, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  notes.transcript.forEach(entry => {
    addPageIfNeeded(lineHeight * 2); // Estimate space for speaker + one line of dialogue
    doc.setFont(undefined, 'bold');
    doc.text(`${entry.speaker}:`, margin, y);
    doc.setFont(undefined, 'normal');
    
    const dialogueIndent = 5;
    const splitDialogue = doc.splitTextToSize(entry.dialogue, maxWidth - dialogueIndent);
    
    splitDialogue.forEach((line: string, index: number) => {
        if (index > 0) { // No need to advance y for the first line, as it's part of the speaker line
            y += 5;
        }
        addPageIfNeeded(5);
        doc.text(line, margin + dialogueIndent, y);
    });
    y += 8; // Extra space between entries
  });

  doc.save('meeting-notes.pdf');
};
