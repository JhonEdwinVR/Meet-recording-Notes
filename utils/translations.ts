
import { Language } from '../constants';

type TranslationKeys = 
  | 'Key Summary'
  | 'Action Items'
  | 'View Full Transcript'
  | 'Download as PDF'
  | 'Download Audio'
  | 'Full Transcript'
  | 'Close';

const translations: Record<Language, Record<TranslationKeys, string>> = {
  'English': {
    'Key Summary': 'Key Summary',
    'Action Items': 'Action Items',
    'View Full Transcript': 'View Full Transcript',
    'Download as PDF': 'Download as PDF',
    'Download Audio': 'Download Audio',
    'Full Transcript': 'Full Transcript',
    'Close': 'Close',
  },
  'Spanish': {
    'Key Summary': 'Resumen Clave',
    'Action Items': 'Puntos de Acción',
    'View Full Transcript': 'Ver Transcripción Completa',
    'Download as PDF': 'Descargar como PDF',
    'Download Audio': 'Descargar Audio',
    'Full Transcript': 'Transcripción Completa',
    'Close': 'Cerrar',
  },
  'French': {
    'Key Summary': 'Résumé Clé',
    'Action Items': 'Actions à Entreprendre',
    'View Full Transcript': 'Voir la Transcription Complète',
    'Download as PDF': 'Télécharger en PDF',
    'Download Audio': 'Télécharger l\'Audio',
    'Full Transcript': 'Transcription Complète',
    'Close': 'Fermer',
  },
  'German': {
    'Key Summary': 'Wichtige Zusammenfassung',
    'Action Items': 'Aktionspunkte',
    'View Full Transcript': 'Vollständiges Transkript Anzeigen',
    'Download as PDF': 'Als PDF Herunterladen',
    'Download Audio': 'Audio Herunterladen',
    'Full Transcript': 'Vollständiges Transkript',
    'Close': 'Schließen',
  },
  'Japanese': {
    'Key Summary': '主な概要',
    'Action Items': 'アクションアイテム',
    'View Full Transcript': '完全な文字起こしを表示',
    'Download as PDF': 'PDFとしてダウンロード',
    'Download Audio': '音声をダウンロード',
    'Full Transcript': '完全な文字起こし',
    'Close': '閉じる',
  },
};

export const getTranslator = (language: Language) => (key: TranslationKeys): string => {
  return translations[language][key] || translations['English'][key];
};