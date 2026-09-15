/**
 * Triggers the native browser print dialogue.
 * The layout will automatically hide the sidebar/header using the .no-print CSS class.
 */
export const printDocument = () => {
  window.print();
};
