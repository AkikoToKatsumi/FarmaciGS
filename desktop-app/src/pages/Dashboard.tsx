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
  totalSalesTrend?: Array<{ date: string; sales: number; returns: number; discounts: number }>;
};

// Sidebar
const Sidebar = styled.nav<{ collapsed: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${({ collapsed }) => (collapsed ? '60px' : '220px')};
  background: #1964aaff;
  color: #fff;
  transition: width 0.2s;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  align-items: ${({ collapsed }) => (collapsed ? 'center' : 'flex-start')};
  padding-top: 1rem;

  @media (max-width: 900px) {
    width: ${({ collapsed }) => (collapsed ? '0px' : '180px')};
    min-width: 0;
    padding-top: 0.5rem;
    z-index: 200;
    left: 0;
    top: 0;
    height: 100vh;
    background: #1964aaff;
    transition: width 0.2s;
    overflow-x: hidden;
  }
`;

const SidebarLogo = styled.div`
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

  @media (max-width: 900px) {
    padding: 0 0.5rem 1rem 0.5rem;
    font-size: 1rem;
    img {
      width: 32px;
      height: 32px;
    }
  }
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
    gap: 14px;
    padding: 12px 18px;
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
    }
    span {
      display: ${({ active }) => (active ? 'inline' : 'inline')};
    }
    @media (max-width: 900px) {
      padding: 10px 10px;
      font-size: 0.95rem;
      gap: 10px;
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

const Main = styled.div<{ $collapsed: boolean }>`
  margin-left: ${({ $collapsed }) => ($collapsed ? '60px' : '220px')};
  transition: margin-left 0.2s;
  padding: 2rem;
  background: #f7f9fb;
  min-height: 100vh;

  @media (max-width: 900px) {
    margin-left: 0;
    padding: 1rem 0.5rem 1.5rem 0.5rem;
  }
`;

const Header = styled.header`
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

const SidebarToggle = styled.button`
  background: none;
  border: none;
  color: #fff;
  margin-left: 10px;
  margin-bottom: 2rem;
  cursor: pointer;
  font-size: 1.5rem;
  align-self: flex-end;
  @media (max-width: 900px) {
    margin-left: 0;
    margin-bottom: 1rem;
    font-size: 1.3rem;
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

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
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

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  // Simulación de datos de gráficos si no existen en el backend
  const salesTrend = stats?.salesTrend || [
    { week: '18/2023', sales: 1700000 },
    { week: '19/2023', sales: 2000000 },
    { week: '20/2023', sales: 2000000 },
    { week: '21/2023', sales: 1000000 },
    { week: '22/2023', sales: 1000000 },
  ];
  const totalSalesTrend = stats?.totalSalesTrend || [
    { date: '5/1/2023', sales: 1000000, returns: 10000, discounts: 5000 },
    { date: '5/2/2023', sales: 1200000, returns: 12000, discounts: 6000 },
    { date: '5/3/2023', sales: 900000, returns: 8000, discounts: 4000 },
    { date: '5/4/2023', sales: 1500000, returns: 15000, discounts: 7000 },
    { date: '5/5/2023', sales: 1100000, returns: 9000, discounts: 3000 },
    // ...más datos
  ];

  // Colores para los gráficos según cantidad
  const getBarColor = (value: number) => {
    if (value < 1000000) return "#e74c3c"; // rojo
    if (value < 1500000) return "#128ef3ff"; // azul
    if (value < 2000000) return "#f10fdeff"; // rosa
    return "#27ae60"; // verde
  };

  const getLineColor = (key: string) => {
    switch (key) {
      case "sales": return "#0e83e4ff";
      case "returns": return "#3ce792ff";
      case "discounts": return "#ec12f3ff";
      default: return "#2563eb";
    }
  };

  // Sidebar menu items
  const menuItems = [
    { label: 'Overview', icon: <BarChart2 />, onClick: () => navigate('/dashboard'), active: true },
    { label: 'Ventas', icon: <ShoppingCart />, onClick: () => navigate('/sales'), show: user?.role_name === 'admin' || user?.role_name === 'cashier' },
    { label: 'Clientes', icon: <Users />, onClick: () => navigate('/clients'), show: user?.role_name === 'admin' || user?.role_name === 'cashier' },
    { label: 'Inventario', icon: <Package />, onClick: () => navigate('/inventory'), show: user?.role_name === 'admin' || user?.role_name === 'pharmacist' },
    { label: 'Prescripciones', icon: <ClipboardList />, onClick: () => navigate('/prescriptions'), show: user?.role_name === 'admin' || user?.role_name === 'pharmacist' },
    { label: 'Usuarios', icon: <User />, onClick: () => navigate('/employees'), show: user?.role_name === 'admin' },
    { label: 'Reportes', icon: <FileText />, onClick: () => navigate('/reports'), show: user?.role_name === 'admin' },
    { label: 'Administración', icon: <Shield />, onClick: () => navigate('/admin'), show: user?.role_name === 'admin' },
    { label: 'Roles', icon: <Layers />, onClick: () => navigate('/roles'), show: user?.role_name === 'admin' },
    { label: 'Proveedores', icon: <Truck />, onClick: () => navigate('/providers'), show: user?.role_name === 'admin' },
    // { label: 'Auditoría', icon: <Activity />, onClick: () => navigate('/audit'), show: user?.role_name === 'admin' },
  ];

  return (
    <>
      <Sidebar collapsed={sidebarCollapsed}>
        <SidebarToggle onClick={() => setSidebarCollapsed((c) => !c)}>
          {sidebarCollapsed ? <Menu size={28} /> : <X size={28} />}
        </SidebarToggle>
        {!sidebarCollapsed && (
          <SidebarLogo>
            <img src="imagenes/logo.png" alt="Logo" />
            Farmacia GS
          </SidebarLogo>
        )}
        <SidebarContent>
          <SidebarMenu>
            {menuItems
              .filter((item) => item.show === undefined || item.show)
              .map((item, idx) => (
                <SidebarMenuItem key={item.label} active={item.active}>
                  <button onClick={item.onClick}>
                    {item.icon}
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter $collapsed={sidebarCollapsed}>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={20} style={{ marginRight: 8 }} />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>
      <Main $collapsed={sidebarCollapsed}>
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
          <p style={{ color: '#e74c3c', background: '#ffeaea', padding: '1rem', borderRadius: 8, borderLeft: '4px solid #e74c3c', margin: '1rem 0' }}>
            {error}
          </p>
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

            <ChartSection>
              <ChartTitle>
                <TrendingUp size={20} color="#27ae60" style={{ marginRight: 8 }} />
                Tendencia Semanal de Ventas Netas
              </ChartTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salesTrend}>
                  <XAxis dataKey="week" label={{ value: "Semana", position: "insideBottom", offset: -5 }} />
                  <YAxis
                    tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`}
                    label={{ value: "Ventas", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip formatter={v => `$${Number(v).toLocaleString("es-ES")}`} />
                  <Bar
                    dataKey="sales"
                    fill="#27ae60"
                    isAnimationActive={true}
                  >
                    {salesTrend.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={getBarColor(entry.sales)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            <ChartSection>
              <ChartTitle>
                <BarChart2 size={20} color="#3498db" style={{ marginRight: 8 }} />
                Tendencia Total de Ventas
              </ChartTitle>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={totalSalesTrend}>
                  <XAxis dataKey="date" label={{ value: "Fecha", position: "insideBottom", offset: -5 }} />
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
                  <Line type="monotone" dataKey="sales" stroke={getLineColor("sales")} name="Ventas Netas" strokeWidth={2} />
                  <Line type="monotone" dataKey="returns" stroke={getLineColor("returns")} name="Devoluciones" strokeWidth={2} />
                  <Line type="monotone" dataKey="discounts" stroke={getLineColor("discounts")} name="Descuentos" strokeWidth={2} />
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