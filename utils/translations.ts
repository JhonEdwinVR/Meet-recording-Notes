import { Language } from '../constants';

type Translations = Record<string, string>;
type TranslationMap = Record<Language, Translations>;

const translations: TranslationMap = {
  English: {
    'Meeting Notes Generator': 'Meeting Notes Generator',
    'Generate meeting notes from audio': 'Generate meeting notes from audio',
    'Language': 'Language',
    'Full Transcript': 'Full Transcript',
    'Close': 'Close',
    'Key Summary': 'Key Summary',
    'Action Items': 'Action Items',
    'View Transcript': 'View Transcript',
    'Download PDF': 'Download PDF',
    'Download Recording': 'Download Recording',
    'Record Another': 'Record Another',
    'Error Processing Audio': 'Error Processing Audio',
    'Record Audio': 'Record Audio',
    'Upload File': 'Upload File',
  },
  Spanish: {
    'Meeting Notes Generator': 'Generador de Notas de Reunión',
    'Generate meeting notes from audio': 'Genere notas de reuniones a partir del audio',
    'Language': 'Idioma',
    'Full Transcript': 'Transcripción Completa',
    'Close': 'Cerrar',
    'Key Summary': 'Resumen Clave',
    'Action Items': 'Puntos de Acción',
    'View Transcript': 'Ver Transcripción',
    'Download PDF': 'Descargar PDF',
    'Download Recording': 'Descargar Grabación',
    'Record Another': 'Grabar Otra Vez',
    'Error Processing Audio': 'Error al Procesar el Audio',
    'Record Audio': 'Grabar Audio',
    'Upload File': 'Subir Archivo',
  },
  French: {
    'Meeting Notes Generator': 'Générateur de Notes de Réunion',
    'Generate meeting notes from audio': 'Générez des notes de réunion à partir de l\'audio',
    'Language': 'Langue',
    'Full Transcript': 'Transcription Complète',
    'Close': 'Fermer',
    'Key Summary': 'Résumé Clé',
    'Action Items': 'Éléments d\'Action',
    'View Transcript': 'Voir la Transcription',
    'Download PDF': 'Télécharger le PDF',
    'Download Recording': 'Télécharger l\'Enregistrement',
    'Record Another': 'Enregistrer un Autre',
    'Error Processing Audio': 'Erreur lors du Traitement Audio',
    'Record Audio': 'Enregistrer l\'Audio',
    'Upload File': 'Téléverser un Fichier',
  },
  German: {
    'Meeting Notes Generator': 'Besprechungsnotizen-Generator',
    'Generate meeting notes from audio': 'Erstellen Sie Besprechungsnotizen aus Audio',
    'Language': 'Sprache',
    'Full Transcript': 'Vollständiges Transkript',
    'Close': 'Schließen',
    'Key Summary': 'Wichtige Zusammenfassung',
    'Action Items': 'Aktionspunkte',
    'View Transcript': 'Transkript Anzeigen',
    'Download PDF': 'PDF Herunterladen',
    'Download Recording': 'Aufnahme Herunterladen',
    'Record Another': 'Erneut Aufnehmen',
    'Error Processing Audio': 'Fehler bei der Audioverarbeitung',
    'Record Audio': 'Audio Aufnehmen',
    'Upload File': 'Datei Hochladen',
  },
  Japanese: {
    'Meeting Notes Generator': '議事録ジェネレーター',
    'Generate meeting notes from audio': '音声から議事録を生成する',
    'Language': '言語',
    'Full Transcript': '完全な文字起こし',
    'Close': '閉じる',
    'Key Summary': '主要な概要',
    'Action Items': 'アクションアイテム',
    'View Transcript': '文字起こしを表示',
    'Download PDF': 'PDFをダウンロード',
    'Download Recording': '録音をダウンロード',
    'Record Another': '再録音',
    'Error Processing Audio': '音声処理エラー',
    'Record Audio': '音声を録音',
    'Upload File': 'ファイルをアップロード',
  },
};

export const getTranslator = (language: Language) => {
  const langTranslations = translations[language] || translations['English'];
  return (key: string): string => {
    return langTranslations[key] || key;
  };
};
