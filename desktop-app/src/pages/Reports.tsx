import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/User';
import { BarChart2, ShoppingCart, Users, Package, ClipboardList, FileText, Shield, Truck, Layers, LogOut, User } from 'lucide-react';
import {
  getSalesReport,
  getExpiringSoonReport,
  getStockLowReport,
} from '../services/report.service';
import { createBackup } from '../services/backup.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styled from 'styled-components';

import {
  FileSpreadsheet,
  FileBarChart2,
  Download,
  Upload,
} from 'lucide-react';

// Add Sidebar components
const Sidebar = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 60px;
  background: #1964aaff;
  color: #fff;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  overflow-x: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarLogo = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem 2rem 0.5rem;
  img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: contain;
    background: #fff;
    cursor: pointer;
  }
`;

const SidebarContent = styled.div`
  flex: 1 1 auto;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const SidebarMenuItem = styled.li<{ active?: boolean }>`
  width: 100%;
  margin-bottom: 8px;
  button {
    width: 100%;
    background: ${({ active }) => (active ? '#2563eb' : 'none')};
    color: #fff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    
    &:hover {
      background: #2563eb;
    }
    
    svg {
      min-width: 22px;
      flex-shrink: 0;
    }
  }
`;

const SidebarFooter = styled.div`
  width: 100%;
  padding: 1.5rem 0.5rem 2rem 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: #1964aaff;
  min-height: 80px;
  box-sizing: border-box;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  transition: color 0.15s;
  &:hover {
    color: #e74c3c;
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Styled Components
const Container = styled.div`
  background: #fafafa;
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-left: 60px;
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
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

const BackToHomeButton = styled.button`
  background-color: #f3f4f6;
  color: #374151;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.04);
  transition:
    background 0.25s,
    color 0.25s,
    box-shadow 0.25s,
    transform 0.15s;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px) scale(1.03);
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
  const { user, clearUser } = useUserStore();
  const [expired, setExpired] = useState([]);
  const navigate = useNavigate();
  const token = useUserStore((s) => s.token);
  const [sales, setSales] = useState([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [expiring, setExpiring] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Pasar el token a los servicios si lo requieren
  const salesRes = await getSalesReport(weekAgo, today);
      setSales(salesRes.sales || []);
      setSalesTotal(salesRes.totalSum || 0);

  const e = await getExpiringSoonReport();
  const l = await getStockLowReport();
      // Separar productos por vencer y vencidos
      const now = new Date();
      setExpiring(e.filter((m: any) => new Date(m.expiration_date) > now));
      setExpired(e.filter((m: any) => new Date(m.expiration_date) <= now));
      setLowStock(l);
    };
    loadReports();
  }, [token]);

  // Permitir solo admin, cajero y farmacéutico (por nombre o id)
  const allowedRoles = ['admin', 'cashier', 'pharmacist', 1, 2, 3];
  if (
    user &&
    !allowedRoles.includes(user.role_name) &&
    !allowedRoles.includes(user.role_id)
  ) {
    return (
      <Container>
        <BackToHomeButton onClick={() => navigate('/dashboard')}>
          ← Volver a inicio
        </BackToHomeButton>
        <NoPerms>No tienes permisos para ver los reportes.</NoPerms>
      </Container>
    );
  }

  // Exportar a CSV
  const exportSalesCSV = () => {
    const header = ['ID', 'Vendedor', 'Total'];
    const rows = sales.map((s: any) => [
      s.id,
      s.seller,
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
      new Date(m.expiration_date).toLocaleDateString(),
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadCSV(csvContent, 'por_vencer.csv');
  };

  const exportExpiredCSV = () => {
    const header = ['ID', 'Nombre', 'Fecha de Vencimiento'];
    const rows = expired.map((m: any) => [
      m.id,
      m.name,
      new Date(m.expiration_date).toLocaleDateString(),
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadCSV(csvContent, 'vencidos.csv');
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
  const exportExcel = (data: any[], filename: string, total?: number) => {
    if (window.electronAPI && window.electronAPI.XLSX) {
      const ws = window.electronAPI.XLSX.utils.json_to_sheet(data);
      const wb = window.electronAPI.XLSX.utils.book_new();
      window.electronAPI.XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
      // Si es ventas y hay total, agrega una fila al final
      if (filename.startsWith('ventas') && typeof total === 'number') {
        const lastRow = data.length + 2;
        window.electronAPI.XLSX.utils.sheet_add_aoa(ws, [['', 'TOTAL', total]], { origin: `A${lastRow}` });
      }
      window.electronAPI.XLSX.writeFile(wb, filename);
    } else {
      // Fallback: crear CSV si XLSX no está disponible
      const header = Object.keys(data[0] || {});
      const rows = data.map((item: any) => header.map(key => item[key]));
      let csvContent = [header, ...rows].map((r) => r.join(',')).join('\n');
      
      if (filename.startsWith('ventas') && typeof total === 'number') {
        csvContent += `\n,TOTAL,${total}`;
      }
      
      downloadCSV(csvContent, filename.replace('.xlsx', '.csv'));
    }
  };

  // Exportar a PDF
  const exportPDF = (data: any[], headers: string[], filename: string, total?: number) => {
    try {
      const doc = new jsPDF();
      const docWithAutoTable = doc as any; // Type assertion para autoTable
      
      // Verificar que autoTable esté disponible
      if (typeof docWithAutoTable.autoTable !== 'function') {
        console.error('jsPDF autoTable plugin no está disponible');
        
        // Método alternativo: generar PDF simple sin tabla
        generateSimplePDF(doc, data, headers, filename, total);
        return;
      }

      // Configurar el documento
      docWithAutoTable.autoTable({
        head: [headers],
        body: data,
        startY: 20,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Si es ventas y hay total, agrega una fila al final
      if (filename.startsWith('ventas') && typeof total === 'number') {
        const finalY = docWithAutoTable.lastAutoTable?.finalY || 50;
        docWithAutoTable.autoTable({
          body: [['', 'TOTAL', `RD$${total.toFixed(2)}`]],
          startY: finalY + 5,
          theme: 'plain',
          styles: { 
            fontSize: 10,
            fontStyle: 'bold', 
            textColor: [37, 99, 235],
            fillColor: [240, 248, 255]
          },
          columnStyles: {
            0: { halign: 'right' },
            1: { halign: 'center', fontStyle: 'bold' },
            2: { halign: 'right', fontStyle: 'bold' }
          }
        });
      }

      doc.save(filename);
    } catch (error) {
      console.error('Error generando PDF:', error);
      
      // Método alternativo: generar PDF simple
      try {
        const doc = new jsPDF();
        generateSimplePDF(doc, data, headers, filename, total);
      } catch (fallbackError) {
        console.error('Error en PDF alternativo:', fallbackError);
        alert('Error generando PDF. Usando CSV como alternativa.');
        
        // Último recurso: CSV
        const csvData = data.map((item: any) => 
          headers.map(header => 
            item[header] || item[headers.indexOf(header)] || ''
          )
        );
        const csvContent = [headers, ...csvData].map((r) => r.join(',')).join('\n');
        downloadCSV(csvContent, filename.replace('.pdf', '.csv'));
      }
    }
  };

  // Método alternativo para generar PDF simple
  const generateSimplePDF = (doc: jsPDF, data: any[], headers: string[], filename: string, total?: number) => {
    // Título
    doc.setFontSize(16);
    doc.text('Reporte - Farmacia GS', 20, 20);
    
    // Headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    let yPosition = 40;
    
    headers.forEach((header, index) => {
      doc.text(header, 20 + (index * 50), yPosition);
    });
    
    // Datos
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    
    data.forEach((row: any, rowIndex) => {
      if (yPosition > 250) { // Nueva página si es necesario
        doc.addPage();
        yPosition = 20;
      }
      
      headers.forEach((header, colIndex) => {
        const value = Array.isArray(row) ? row[colIndex] : row[header];
        doc.text(String(value || ''), 20 + (colIndex * 50), yPosition);
      });
      
      yPosition += 8;
    });
    
    // Total si aplica
    if (filename.startsWith('ventas') && typeof total === 'number') {
      yPosition += 10;
      doc.setFont(undefined, 'bold');
      doc.text(`TOTAL: RD$${total.toFixed(2)}`, 20, yPosition);
    }
    
    doc.save(filename);
  };

  // Backup manual
  const handleBackup = async () => {
    try {
      const result = await createBackup(token!);
      // Si el backend retorna la ruta o nombre del archivo, descarga el backup
      if (result && result.filename) {
        // Asume que el backend expone el archivo en /backups/:filename o similar
        const url = `http://localhost:4004/backups/${encodeURIComponent(result.filename)}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Backup creado, pero no se pudo descargar automáticamente.');
      }
    } catch (err) {
      alert('Error al crear o descargar el backup.');
    }
  };

  // Restore manual (no implementado en el servicio frontend)
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    alert('Funcionalidad de restaurar backup no implementada en frontend.');
  };

  return (
    <>
      {/* Add Sidebar */}
      <Sidebar>
        <SidebarLogo onClick={() => navigate('/dashboard')}>
          <img src="imagenes/logo.png" alt="Logo" />
        </SidebarLogo>
        
        <SidebarContent>
          <SidebarMenu>
            {/* Overview */}
            <SidebarMenuItem>
              <button onClick={() => navigate('/dashboard')} title="Overview">
                <BarChart2 />
              </button>
            </SidebarMenuItem>
            
            {/* Ventas */}
            {(user?.role_name === 'admin' || user?.role_name === 'cashier' || user?.role_name === 'pharmacist') && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/sales')} title="Ventas">
                  <ShoppingCart />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Clientes */}
            {(user?.role_name === 'admin' || user?.role_name === 'cashier' || user?.role_name === 'pharmacist') && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/clients')} title="Clientes">
                  <Users />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Inventario */}
            {(user?.role_name === 'admin' || user?.role_name === 'pharmacist') && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/inventory')} title="Inventario">
                  <Package />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Prescripciones */}
            {(user?.role_name === 'admin' || user?.role_name === 'pharmacist') && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/prescriptions')} title="Prescripciones">
                  <ClipboardList />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Usuarios */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/Users')} title="Usuarios">
                  <User />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Reportes */}
            {(user?.role_name === 'admin' || user?.role_name === 'pharmacist' || user?.role_name === 'cashier') && (
              <SidebarMenuItem active={true}>
                <button onClick={() => navigate('/reports')} title="Reportes">
                  <FileText />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Administración */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/admin')} title="Administración">
                  <Shield />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Roles */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/roles')} title="Roles">
                  <Layers />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Proveedores */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/providers')} title="Proveedores">
                  <Truck />
                </button>
              </SidebarMenuItem>
            )}
            
            {/* Categorías */}
            {user?.role_name === 'admin' && (
              <SidebarMenuItem>
                <button onClick={() => navigate('/categories')} title="Categorías">
                  <Layers />
                </button>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter>
          <LogoutButton onClick={() => {
            clearUser();
            navigate('/login');
          }} title="Cerrar Sesión">
            <LogOut size={20} />
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <Container>
        <BackToHomeButton onClick={() => navigate('/dashboard')}>
          ← Volver a inicio
        </BackToHomeButton>
        <Title>Reportes</Title>

        {/* Backup y Restore solo admin */}
        {user?.role_name === 'admin' && (
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
        )}

        {/* Ventas del día: solo admin y cajero */}
        {(user?.role_name === 'admin' || user?.role_name === 'cashier') && (
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
                      sales.map((s: any) => ({
                        ID: s.id,
                        Vendedor: s.seller,
                        Total: s.total,
                      })),
                      'ventas.xlsx',
                      salesTotal
                    )
                  }
                  title="Excel"
                >
                  <FileSpreadsheet size={16} /> Excel
                </IconButton>
                <IconButton
                  onClick={() =>
                    exportPDF(
                      sales.map((s: any) => [s.id, s.seller, s.total]),
                      ['ID', 'Vendedor', 'Total'],
                      'ventas.pdf',
                      salesTotal
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
                  #{s.id} - Vendedor: {s.seller} - RD${s.total}
                </ListItem>
              ))}
            </List>
            {/* Mostrar sumatoria de ventas */}
            <div style={{ marginTop: '1rem', fontWeight: 600, fontSize: '1.1rem', color: '#2563eb', textAlign: 'right' }}>
              Total de ventas: RD${salesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </Section>
        )}

        {/* Productos por vencer: solo admin y farmacéutico */}
          {(user?.role_name === 'admin' || user?.role_name === 'pharmacist') && (
            <>
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
                          expiring.map((m: any) => ({
                            ID: m.id,
                            Nombre: m.name,
                            'Fecha de Vencimiento': new Date(m.expiration_date).toLocaleDateString(),
                          })),
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
                            new Date(m.expiration_date).toLocaleDateString(),
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
                  {expiring.length === 0 && (
                    <ListItem style={{ color: '#d97706' }}>No hay medicamentos próximos a vencer.</ListItem>
                  )}
                  {expiring.map((m: any) => (
                    <ListItem key={m.id}>
                      #{m.id} - {m.name} - Vence: {new Date(m.expiration_date).toLocaleDateString()}
                    </ListItem>
                  ))}
                </List>
              </Section>
              <Section>
                <SectionHeader>
                  <SectionTitle>Medicamentos vencidos</SectionTitle>
                  <ButtonGroup>
                    <IconButton onClick={exportExpiredCSV} title="CSV">
                      <FileText size={16} /> CSV
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        exportExcel(
                          expired.map((m: any) => ({
                            ID: m.id,
                            Nombre: m.name,
                            'Fecha de Vencimiento': new Date(m.expiration_date).toLocaleDateString(),
                          })),
                          'vencidos.xlsx'
                        )
                      }
                      title="Excel"
                    >
                      <FileSpreadsheet size={16} /> Excel
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        exportPDF(
                          expired.map((m: any) => [
                            m.id,
                            m.name,
                            new Date(m.expiration_date).toLocaleDateString(),
                          ]),
                          ['ID', 'Nombre', 'Fecha de Vencimiento'],
                          'vencidos.pdf'
                        )
                      }
                      title="PDF"
                    >
                      <FileBarChart2 size={16} /> PDF
                    </IconButton>
                  </ButtonGroup>
                </SectionHeader>
                <List>
                  {expired.length === 0 && (
                    <ListItem style={{ color: '#dc2626' }}>No hay medicamentos vencidos.</ListItem>
                  )}
                  {expired.map((m: any) => (
                    <ListItem key={m.id}>
                      #{m.id} - {m.name} - Venció: {new Date(m.expiration_date).toLocaleDateString()}
                    </ListItem>
                  ))}
                </List>
              </Section>
            </>
          )}

        {/* Stock bajo: solo admin y farmacéutico */}
        {(user?.role_name === 'admin' || user?.role_name === 'pharmacist') && (
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
                      lowStock.map((m: any) => ({
                        ID: m.id,
                        Nombre: m.name,
                        Stock: m.stock,
                      })),
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
        )}
      </Container>
    </>
  );
};

export default Reports;
