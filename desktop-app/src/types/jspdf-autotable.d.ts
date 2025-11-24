declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: any[][];
      body?: any[][];
      startY?: number;
      theme?: string;
      styles?: any;
      headStyles?: any;
      alternateRowStyles?: any;
      columnStyles?: any;
      margin?: any;
      tableWidth?: string | number;
      showHead?: boolean;
      showFoot?: boolean;
      tableLineColor?: number[];
      tableLineWidth?: number;
    }) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}
