// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUserStore } from '../store/user';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, DashboardStats } from '../services/dashboard.service';
import {
  User,
  BarChart2,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Layers,
  LogOut,
  FileText,
  ClipboardList,
  Shield,
  Truck,
  Activity,
  Menu,
  X,
  DollarSign,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, Cell } from 'recharts';

type DashboardStatsWithTrends = DashboardStats & {
  salesTrend?: Array<{ week: string; sales: number }>;
  totalSalesTrend?: Array<{ date?: string; month?: string; year?: string; sales: number; returns: number; discounts: number }>;
};

// Sidebar
const Sidebar = styled.nav<{ collapsed: boolean; isMobile: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${({ collapsed, isMobile }) => {
    if (isMobile) {
      return collapsed ? '0px' : '250px';
    }
    return collapsed ? '60px' : '220px';
  }};
  background: #1964aaff;
  color: #fff;
  transition: width 0.3s ease, transform 0.3s ease;
  z-index: ${({ isMobile }) => isMobile ? '1000' : '100'};
  box-shadow: 2px 0 8px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  align-items: ${({ collapsed, isMobile }) => (collapsed && !isMobile ? 'center' : 'flex-start')};
  padding-top: 1rem;
  transform: ${({ collapsed, isMobile }) => 
    isMobile && collapsed ? 'translateX(-100%)' : 'translateX(0)'};
  overflow-x: hidden;

  @media (max-width: 768px) {
    width: ${({ collapsed }) => (collapsed ? '0px' : '280px')};
    box-shadow: ${({ collapsed }) => collapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.3)'};
  }
`;

const SidebarOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${({ show }) => show ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const SidebarLogo = styled.div<{ collapsed: boolean; isMobile: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 1rem 2rem 1rem;
  img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: contain;
    background: #fff;
  }
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  opacity: ${({ collapsed, isMobile }) => (collapsed && !isMobile ? '0' : '1')};
  transition: opacity 0.3s ease;

  @media (max-width: 768px) {
    padding: 0 0.5rem 1rem 0.5rem;
    font-size: 1.1rem;
    opacity: 1;
    img {
      width: 32px;
      height: 32px;
    }
  }
`;

const SidebarMenuItem = styled.li<{ active?: boolean; collapsed?: boolean; isMobile?: boolean }>`
  width: 100%;
  margin-bottom: 8px;
  button {
    width: 100%;
    background: ${({ active }) => (active ? '#2563eb' : 'none')};
    color: #fff;
    border: none;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
    justify-content: ${({ collapsed, isMobile }) => 
      (collapsed && !isMobile) ? 'center' : 'flex-start'};
    
    &:hover {
      background: #2563eb;
    }
    
    svg {
      min-width: 22px;
      flex-shrink: 0;
    }
    
    span {
      display: ${({ collapsed, isMobile }) => 
        (collapsed && !isMobile) ? 'none' : 'inline'};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 768px) {
      padding: 14px 16px;
      font-size: 0.95rem;
      gap: 12px;
      
      span {
        display: inline;
      }
    }
  }
`;

const SidebarFooter = styled.div<{ $collapsed: boolean }>`
  width: 100%;
  padding: 1.5rem 1.5rem 2rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: #1964aaff;
  min-height: 80px;
  box-sizing: border-box;

  @media (max-width: 900px) {
    padding: 1rem 0.5rem 1.5rem 0.5rem;
    min-height: 60px;
  }
`;

const Main = styled.div<{ $collapsed: boolean; $isMobile: boolean }>`
  margin-left: ${({ $collapsed, $isMobile }) => {
    if ($isMobile) return '0px';
    return $collapsed ? '60px' : '220px';
  }};
  transition: margin-left 0.3s ease;
  padding: 2rem;
  background: #f7f9fb;

  
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const Header = styled.header`
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #eee;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1964aaff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 600px) {
    font-size: 1.2rem;
    gap: 6px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  @media (max-width: 600px) {
    gap: 0.5rem;
    font-size: 0.95rem;
  }
`;

const DashboardGrid = styled.div`
  background-color: #f5f7fa7c;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const DashboardCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e8ed;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  h3 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  @media (max-width: 600px) {
    padding: 1rem;
    border-radius: 8px;
    h3 {
      font-size: 0.95rem;
      gap: 4px;
    }
  }
`;

const ChartSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e8ed;
  padding: 2rem;
  margin-bottom: 2rem;
  @media (max-width: 600px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1964aaff;
  margin-bottom: 1.5rem;
  @media (max-width: 600px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const RecentActivities = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e8ed;
  h3 {
    margin: 0 0 1rem 0;
    color: #4e81d8ff;
    font-size: 1.2rem;
    font-weight: 600;
    border-bottom: 2px solid #4561e2ff;
    padding-bottom: 0.5rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #e1e8ed;
    color: #4a5568;
    font-size: 0.9rem;
    line-height: 1.5;
    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background: #f7fafc;
      margin: 0 -1rem;
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 4px;
    }
  }
  @media (max-width: 600px) {
    padding: 1rem;
    border-radius: 8px;
    h3 {
      font-size: 1rem;
      padding-bottom: 0.3rem;
    }
    li {
      font-size: 0.85rem;
    }
  }
`;

const SidebarToggle = styled.button<{ isMobile: boolean }>`
  background: none;
  border: none;
  color: #fff;
  margin-left: ${({ isMobile }) => isMobile ? '0' : '10px'};
  margin-bottom: 2rem;
  cursor: pointer;
  font-size: 1.5rem;
  align-self: ${({ isMobile }) => isMobile ? 'flex-start' : 'flex-end'};
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 1rem;
    font-size: 1.4rem;
    align-self: flex-start;
    margin-left: 1rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: #1964aaff;
  border: none;
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }

  @media (max-width: 768px) {
    display: block;
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

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.15s;
  &:hover {
    color: #e74c3c;
  }
`;

const UserName = styled.span`
  font-size: 1rem;
  font-weight: 500;
`;

const Role = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
  background: rgba(25, 100, 170, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
`;

const DashboardStat = styled.p`
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #2563eb;
  text-align: left;
`;

const Dashboard = () => {
  const { user, clearUser } = useUserStore();
  const token = useUserStore((s) => s.token);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStatsWithTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true); // Start collapsed on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        // El backend debe retornar salesTrend y totalSalesTrend en el objeto de stats
        const data = await getDashboardStats(token);
        setStats(data);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas del dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // Usar los datos del backend si existen, si no, fallback vacío
  const salesTrend = stats?.salesTrend || [];
  const totalSalesTrend = stats?.totalSalesTrend || [];

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  // Colores para los gráficos según cantidad
  const getBarColor = (value: number) => {
    if (value < 1000000) return "#e74c3c"; // rojo
    if (value < 1500000) return "#128ef3ff"; // azul
    if (value < 2000000) return "#0f13f1ff"; // rosa
    return "#27ae60"; // verde
  };

  const getLineColor = (key: string) => {
    switch (key) {
      case "sales": return "#0e83e4ff";
      case "returns": return "#3ce792ff";
      case "discounts": return "#3b12f3ff";
      default: return "#2563eb";
    }
  };

  // Sidebar menu items con autorización por usuario
  const menuItems = [
    // Todos pueden ver Overview
    { label: 'Overview', icon: <BarChart2 />, onClick: () => navigate('/dashboard'), active: true, show: true },
    // Ventas
    { label: 'Ventas', icon: <ShoppingCart />, onClick: () => navigate('/sales'), show: user?.role_name === 'admin' || user?.role_name === 'cashier' || user?.role_name === 'pharmacist' },
    // Clientes
    { label: 'Clientes', icon: <Users />, onClick: () => navigate('/clients'), show: user?.role_name === 'admin' || user?.role_name === 'cashier' || user?.role_name === 'pharmacist' },
    // Inventario
    { label: 'Inventario', icon: <Package />, onClick: () => navigate('/inventory'), show: user?.role_name === 'admin' || user?.role_name === 'pharmacist' },
    // Prescripciones
    { label: 'Prescripciones', icon: <ClipboardList />, onClick: () => navigate('/prescriptions'), show: user?.role_name === 'admin' || user?.role_name === 'pharmacist' },
    // Usuarios
    { label: 'Usuarios', icon: <User />, onClick: () => navigate('/Users'), show: user?.role_name === 'admin' },
    // Reportes
    { 
      label: 'Reportes', 
      icon: <FileText />, 
      onClick: () => navigate('/reports'), 
      show: user?.role_name === 'admin' 
        || user?.role_name === 'pharmacist' 
        || user?.role_name === 'cashier' 
    },
    // Administración
    { label: 'Administración', icon: <Shield />, onClick: () => navigate('/admin'), show: user?.role_name === 'admin' },
    // Roles
    { label: 'Roles', icon: <Layers />, onClick: () => navigate('/roles'), show: user?.role_name === 'admin' },
    // Proveedores
    { label: 'Proveedores', icon: <Truck />, onClick: () => navigate('/providers'), show: user?.role_name === 'admin' },
    // { label: 'Auditoría', icon: <Activity />, onClick: () => navigate('/audit'), show: user?.role_name === 'admin' },
  ];

  // Nuevo estado para tipo de rango de tendencia
  const [trendType, setTrendType] = useState<'semana' | 'mes' | 'año'>('semana');

  // Nuevo estado para los datos de tendencia
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // Nuevo estado para la tendencia histórica (mensual por defecto)
  const [historicalTrendData, setHistoricalTrendData] = useState<any[]>([]);
  const [historicalTrendType, setHistoricalTrendType] = useState<'semana' | 'mes' | 'año'>('mes');

  // Función para obtener los datos de tendencia según el tipo seleccionado
  const fetchTrendData = async () => {
    if (!token) return;
    setTrendLoading(true);
    try {
      const data = await getDashboardStats(token, trendType);
      setStats(data);
      if (trendType === 'semana') setTrendData(data.salesTrend || []);
      else setTrendData(data.totalSalesTrend || []);
    } catch (err) {
      setError('No se pudieron cargar los datos de tendencia.');
    } finally {
      setTrendLoading(false);
    }
  };

  // Nueva función para obtener la tendencia histórica (semana, mes o año)
  const fetchHistoricalTrendData = async (type: 'semana' | 'mes' | 'año' = 'mes') => {
    if (!token) return;
    try {
      const data = await getDashboardStats(token, type);
      if (type === 'semana') setHistoricalTrendData(data.salesTrend || []);
      else setHistoricalTrendData(data.totalSalesTrend || []);
      setHistoricalTrendType(type);
    } catch (err) {
      // No mostrar error aquí para no sobreescribir el error principal
    }
  };

  // Llama a fetchTrendData cuando cambia trendType o token
  useEffect(() => {
    fetchTrendData();
    // eslint-disable-next-line
  }, [trendType, token]);

  // Llama a fetchHistoricalTrendData cuando cambia historicalTrendType o token
  useEffect(() => {
    fetchHistoricalTrendData(historicalTrendType);
    // eslint-disable-next-line
  }, [historicalTrendType, token]);

  return (
    <>
      {isMobile && (
        <MobileMenuButton onClick={handleSidebarToggle}>
          <Menu size={24} />
        </MobileMenuButton>
      )}
      
      <SidebarOverlay show={isMobile && !sidebarCollapsed} onClick={handleOverlayClick} />
      
      <Sidebar collapsed={sidebarCollapsed} isMobile={isMobile}>
        {!isMobile && (
          <SidebarToggle isMobile={isMobile} onClick={handleSidebarToggle}>
            {sidebarCollapsed ? <Menu size={28} /> : <X size={28} />}
          </SidebarToggle>
        )}
        
        {(!sidebarCollapsed || isMobile) && (
          <SidebarLogo collapsed={sidebarCollapsed} isMobile={isMobile}>
            {isMobile && (
              <button 
                onClick={handleSidebarToggle}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#fff', 
                  marginLeft: 'auto',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            )}
            <img src="imagenes/logo.png" alt="Logo" />
            {!isMobile && <span>Farmacia GS</span>}
            {isMobile && <span>Farmacia GS</span>}
          </SidebarLogo>
        )}
        
        <SidebarContent>
          <SidebarMenu>
            {menuItems
              .filter((item) => item.show)
              .map((item, idx) => (
                <SidebarMenuItem 
                  key={item.label} 
                  active={item.active}
                  collapsed={sidebarCollapsed}
                  isMobile={isMobile}
                >
                  <button onClick={() => {
                    item.onClick();
                    if (isMobile) setSidebarCollapsed(true);
                  }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter $collapsed={sidebarCollapsed}>
          <LogoutButton onClick={() => {
            handleLogout();
            if (isMobile) setSidebarCollapsed(true);
          }}>
            <LogOut size={20} style={{ marginRight: 8 }} />
            {(!sidebarCollapsed || isMobile) && <span>Cerrar Sesión</span>}
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>
      
      <Main $collapsed={sidebarCollapsed} $isMobile={isMobile}>
        <Header>
          <Title>
            <BarChart2 size={32} />
            Panel Principal de Farmacia GS
          </Title>
          <UserInfo>
            <User size={30} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            <UserName>Bienvenido, {user?.name}</UserName>
            {user?.role_name && <Role>({user.role_name})</Role>}
          </UserInfo>
        </Header>
        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666', margin: '2rem 0' }}>
            Cargando estadísticas...
          </p>
        ) : error ? (
          <div style={{ color: '#e74c3c', background: '#ffeaea', padding: '1rem', borderRadius: 8, borderLeft: '4px solid #e74c3c', margin: '1rem 0', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>{error}</div>
            <button
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              Volver atrás
            </button>
          </div>
        ) : stats ? (
          <>
            <DashboardGrid>
              <DashboardCard>
                <h3><DollarSign size={20} color="#27ae60" /> Ventas del Día</h3>
                <DashboardStat style={{ color: "#27ae60" }}>
                  ${stats.dailySales.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </DashboardStat>
              </DashboardCard>
              <DashboardCard>
                <h3><ShoppingCart size={20} color="#3498db" /> Productos Vendidos</h3>
                <DashboardStat style={{ color: stats.productsSold < 100 ? "#e74c3c" : stats.productsSold < 200 ? "#f39c12" : "#27ae60" }}>
                  {stats.productsSold}
                </DashboardStat>
              </DashboardCard>
              <DashboardCard>
                <h3><Users size={20} color="#8e44ad" /> Clientes Atendidos</h3>
                <DashboardStat style={{ color: stats.clientsServed < 50 ? "#e74c3c" : stats.clientsServed < 100 ? "#f39c12" : "#27ae60" }}>
                  {stats.clientsServed}
                </DashboardStat>
              </DashboardCard>
              <DashboardCard>
                <h3><Package size={20} color="#e67e22" /> Stock Bajo</h3>
                <DashboardStat style={{ color: stats.lowStockCount > 10 ? "#e74c3c" : stats.lowStockCount > 5 ? "#f39c12" : "#27ae60" }}>
                  {stats.lowStockCount}
                </DashboardStat>
              </DashboardCard>
            </DashboardGrid>

            {/* Selector de tendencia */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <label style={{ fontWeight: 600, color: '#2563eb' }}>Ver tendencia por:</label>
              <select
                value={trendType}
                onChange={e => setTrendType(e.target.value as 'semana' | 'mes' | 'año')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  background: 'white',
                  color: '#2563eb',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
                <option value="año">Año</option>
              </select>
              <span style={{ marginLeft: 24, fontWeight: 600, color: '#2563eb' }}>Histórico:</span>
              <select
                value={historicalTrendType}
                onChange={e => setHistoricalTrendType(e.target.value as 'semana' | 'mes' | 'año')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  background: 'white',
                  color: '#128ef3',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
                <option value="año">Año</option>
              </select>
            </div>

            {/* Gráfica de tendencia */}
            <ChartSection>
              <ChartTitle>
                <TrendingUp size={20} color="#27ae60" style={{ marginRight: 8 }} />
                {trendType === 'semana'
                  ? 'Tendencia Semanal de Ventas Netas'
                  : trendType === 'mes'
                  ? 'Tendencia Mensual de Ventas Netas'
                  : 'Tendencia Anual de Ventas Netas'}
              </ChartTitle>
              <ResponsiveContainer width="100%" height={220}>
                {trendType === 'semana' ? (
                  <BarChart data={trendData} barCategoryGap={32}>
                    <XAxis dataKey="week" label={{ value: "Semana", position: "insideBottom", offset: -5 }} />
                    <YAxis
                      tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`}
                      label={{ value: "Ventas", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip formatter={v => `$${Number(v).toLocaleString("es-ES")}`} />
                    <Bar
                      dataKey="sales"
                      fill="#128ef3"
                      barSize={28}
                      // @ts-ignore: recharts types don't acept array but it works for rounded bars
                      radius={[8, 8, 8, 8]}
                    >
                      {trendData.map((entry, idx) => (
                        <Cell
                          // @ts-ignore
                          key={`cell-${idx}`}
                          fill={idx % 2 === 0 ? "#128ef3" : "#0f13f1"}
                          // @ts-ignore
                          radius={[8, 8, 8, 8]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart data={trendData}>
                    <XAxis dataKey={trendType === 'mes' ? 'month' : 'year'} label={{ value: trendType === 'mes' ? "Mes" : "Año", position: "insideBottom", offset: -5 }} />
                    <YAxis
                      tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`}
                      label={{ value: "Monto", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip formatter={v => `$${Number(v).toLocaleString("es-ES")}`} />
                    <CartesianGrid stroke="#e1e8ed" />
                    <Legend
                      formatter={value => {
                        if (value === "sales") return "Ventas Netas";
                        if (value === "returns") return "Devoluciones";
                        if (value === "discounts") return "Descuentos";
                        return value;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#128ef3"
                      name="Ventas Netas"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#128ef3" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="returns"
                      stroke="#0f13f1"
                      name="Devoluciones"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#0f13f1" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="discounts"
                      stroke="#2563eb"
                      name="Descuentos"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#2563eb" }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </ChartSection>

            {/* Gráfico de líneas clásico: Ventas, Devoluciones y Descuentos */}
            <ChartSection>
              <ChartTitle>
                <TrendingUp size={20} color="#128ef3" style={{ marginRight: 8 }} />
                Ventas, Devoluciones y Descuentos (Histórico)
              </ChartTitle>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={historicalTrendData}>
                  <XAxis
                    dataKey={
                      historicalTrendType === 'año'
                        ? 'year'
                        : historicalTrendType === 'mes'
                        ? 'month'
                        : 'week'
                    }
                    label={{
                      value:
                        historicalTrendType === 'año'
                          ? 'Año'
                          : historicalTrendType === 'mes'
                          ? 'Mes'
                          : 'Semana',
                      position: 'insideBottom',
                      offset: -5
                    }}
                  />
                  <YAxis
                    tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`}
                    label={{ value: "Monto", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip formatter={v => `$${Number(v).toLocaleString("es-ES")}`} />
                  <CartesianGrid stroke="#e1e8ed" />
                  <Legend
                    formatter={value => {
                      if (value === "sales") return "Ventas Netas";
                      if (value === "returns") return "Devoluciones";
                      if (value === "discounts") return "Descuentos";
                      return value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#128ef3"
                    name="Ventas Netas"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#128ef3" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="returns"
                    stroke="#f10f0fff"
                    name="Devoluciones"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#f10f35ff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="discounts"
                    stroke="#5deb25ff"
                    name="Descuentos"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#25eb25ff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>

            <RecentActivities>
              <h3>Actividades Recientes</h3>
              <ul>
                {stats.recentActivities.map((activity) => (
                  <li key={activity.id}>
                    <span style={{ fontWeight: 'bold' }}>{activity.action}</span> — por <em>{activity.user?.name || 'Sistema'}</em><br />
                    <small style={{ color: '#666' }}>{new Date(activity.created_at).toLocaleString("es-ES")}</small>
                  </li>
                ))}
              </ul>
            </RecentActivities>
          </>
        ) : null}
      </Main>
    </>
  );
};

export default Dashboard;