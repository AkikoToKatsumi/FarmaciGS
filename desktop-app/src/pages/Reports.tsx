import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/user';
import {
  getSalesReport,
  getExpiringSoonReport,
  getStockLowReport,
} from '../services/report.service';
import { createBackup } from '../services/backup.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styled from 'styled-components';

import 'jspdf-autotable'; // Esto es imprescindible

import {
  FileSpreadsheet,
  FileText,
  FileBarChart2,
  ArrowLeft,
  Download,
  Upload,
  FileX,
  FileCheck,
  FilePlus2,
} from 'lucide-react';

// Styled Components
const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: #f1f3f6;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #e2e6ea;
  }
`;

const BackButton = styled(IconButton)`
  background: #6c757d;
  color: #fff;
  margin-bottom: 1.5rem;
  &:hover {
    background: #27cf35ff;
  }
`;

const BackupButton = styled(IconButton)`
  background: #2563eb;
  color: #fff;
  &:hover {
    background: #1d4ed8;
  }
`;

const RestoreLabel = styled.label`
  background: #059669;
  color: #fff;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  &:hover {
    background: #047857;
  }
  input {
    display: none;
  }
`;

const List = styled.ul`
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
  background: #fafbfc;
`;

const ListItem = styled.li`
  padding: 0.3rem 0;
  border-bottom: 1px solid #f1f3f6;
  &:last-child {
    border-bottom: none;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
`;

const NoPerms = styled.div`
  padding: 2rem;
  text-align: center;
  color: #b91c1c;
  font-weight: 600;
`;

const Reports = () => {
  const navigate = useNavigate();
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  const [sales, setSales] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const s = await getSalesReport(weekAgo, today, token!);
      const e = await getExpiringSoonReport(token!);
      const l = await getStockLowReport(token!);

      setSales(s);
      setExpiring(e);
      setLowStock(l);
    };
    loadReports();
  }, [token]);

  // Permitir solo admin, cajero y farmacéutico (por nombre o id)
  const allowedRoles = ['admin', 'cashier', 'pharmacist', 1, 2, 3];
  if (
    user &&
    !allowedRoles.includes(user.role) &&
    !allowedRoles.includes(user.role_id)
  ) {
    return (
      <Container>
        <BackButton onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </BackButton>
        <NoPerms>No tienes permisos para ver los reportes.</NoPerms>
      </Container>
    );
  }

  // Exportar a CSV
  const exportSalesCSV = () => {
    const header = ['ID', 'Cliente', 'Total'];
    const rows = sales.map((s: any) => [
      s.id,
      s.client?.name || 'Cliente General',
      s.total,
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadCSV(csvContent, 'ventas.csv');
  };

  const exportExpiringCSV = () => {
    const header = ['ID', 'Nombre', 'Fecha de Vencimiento'];
    const rows = expiring.map((m: any) => [
      m.id,
      m.name,
      new Date(m.expirationDate).toLocaleDateString(),
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadCSV(csvContent, 'por_vencer.csv');
  };

  const exportLowStockCSV = () => {
    const header = ['ID', 'Nombre', 'Stock'];
    const rows = lowStock.map((m: any) => [
      m.id,
      m.name,
      m.stock,
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadCSV(csvContent, 'stock_bajo.csv');
  };

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Exportar a Excel
  const exportExcel = (data: any[], headers: string[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((row) => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      })
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, filename);
  };

  // Exportar a PDF
  const exportPDF = (data: any[], headers: string[], filename: string) => {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [headers],
      body: data,
    });
    doc.save(filename);
  };

  // Backup manual
  const handleBackup = async () => {
    await createBackup(token!);
  };

  // Restore manual (no implementado en el servicio frontend)
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    alert('Funcionalidad de restaurar backup no implementada en frontend.');
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} /> Volver a Inicio
      </BackButton>
      <Title>Reportes</Title>

      {/* Backup y Restore */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <BackupButton onClick={handleBackup}>
          <Download size={16} /> Descargar Backup
        </BackupButton>
        <RestoreLabel>
          <Upload size={16} /> Restaurar Backup
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
          />
        </RestoreLabel>
      </div>

      {/* Ventas del día */}
      <Section>
        <SectionHeader>
          <SectionTitle>Ventas (últimos 7 días)</SectionTitle>
          <ButtonGroup>
            <IconButton onClick={exportSalesCSV} title="CSV">
              <FileText size={16} /> CSV
            </IconButton>
            <IconButton
              onClick={() =>
                exportExcel(
                  sales.map((s: any) => [s.id, s.client?.name || 'Cliente General', s.total]),
                  ['ID', 'Cliente', 'Total'],
                  'ventas.xlsx'
                )
              }
              title="Excel"
            >
              <FileSpreadsheet size={16} /> Excel
            </IconButton>
            <IconButton
              onClick={() =>
                exportPDF(
                  sales.map((s: any) => [s.id, s.client?.name || 'Cliente General', s.total]),
                  ['ID', 'Cliente', 'Total'],
                  'ventas.pdf'
                )
              }
              title="PDF"
            >
              <FileBarChart2 size={16} /> PDF
            </IconButton>
          </ButtonGroup>
        </SectionHeader>
        <List>
          {sales.map((s: any) => (
            <ListItem key={s.id}>
              #{s.id} - {s.client?.name || 'Cliente General'} - RD${s.total}
            </ListItem>
          ))}
        </List>
      </Section>

      {/* Productos por vencer */}
      <Section>
        <SectionHeader>
          <SectionTitle>Medicamentos por vencer</SectionTitle>
          <ButtonGroup>
            <IconButton onClick={exportExpiringCSV} title="CSV">
              <FileText size={16} /> CSV
            </IconButton>
            <IconButton
              onClick={() =>
                exportExcel(
                  expiring.map((m: any) => [
                    m.id,
                    m.name,
                    new Date(m.expirationDate).toLocaleDateString(),
                  ]),
                  ['ID', 'Nombre', 'Fecha de Vencimiento'],
                  'por_vencer.xlsx'
                )
              }
              title="Excel"
            >
              <FileSpreadsheet size={16} /> Excel
            </IconButton>
            <IconButton
              onClick={() =>
                exportPDF(
                  expiring.map((m: any) => [
                    m.id,
                    m.name,
                    new Date(m.expirationDate).toLocaleDateString(),
                  ]),
                  ['ID', 'Nombre', 'Fecha de Vencimiento'],
                  'por_vencer.pdf'
                )
              }
              title="PDF"
            >
              <FileBarChart2 size={16} /> PDF
            </IconButton>
          </ButtonGroup>
        </SectionHeader>
        <List>
          {expiring.map((m: any) => (
            <ListItem key={m.id}>
              {m.name} - Vence:{' '}
              {new Date(m.expirationDate).toLocaleDateString()}
            </ListItem>
          ))}
        </List>
      </Section>

      {/* Stock bajo */}
      <Section>
        <SectionHeader>
          <SectionTitle>Stock Bajo</SectionTitle>
          <ButtonGroup>
            <IconButton onClick={exportLowStockCSV} title="CSV">
              <FileText size={16} /> CSV
            </IconButton>
            <IconButton
              onClick={() =>
                exportExcel(
                  lowStock.map((m: any) => [m.id, m.name, m.stock]),
                  ['ID', 'Nombre', 'Stock'],
                  'stock_bajo.xlsx'
                )
              }
              title="Excel"
            >
              <FileSpreadsheet size={16} /> Excel
            </IconButton>
            <IconButton
              onClick={() =>
                exportPDF(
                  lowStock.map((m: any) => [m.id, m.name, m.stock]),
                  ['ID', 'Nombre', 'Stock'],
                  'stock_bajo.pdf'
                )
              }
              title="PDF"
            >
              <FileBarChart2 size={16} /> PDF
            </IconButton>
          </ButtonGroup>
        </SectionHeader>
        <List>
          {lowStock.map((m: any) => (
            <ListItem key={m.id}>
              {m.name} - Quedan: {m.stock}
            </ListItem>
          ))}
        </List>
      </Section>
    </Container>
  );
};

export default Reports;
