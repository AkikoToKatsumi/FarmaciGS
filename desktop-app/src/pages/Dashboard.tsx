// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUserStore } from '../store/user';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, DashboardStats } from '../services/dashboard.service';
import { User } from 'lucide-react';

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f7fa7c;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.header`
img { url: 'imagenes/logo.png'; }
   
  background: #1964aaff;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const UserName = styled.span`
  font-size: 1rem;
  font-weight: 500;
`;

const Role = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
`;

const LogoutButton = styled.button`
  background: rgba(146, 130, 130, 0.42);
  color: white;
  border: 2px solid rgba(54, 46, 46, 0.44);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba(238, 11, 11, 0.87);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Navigation = styled.nav`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: center;
  }
`;

const NavButton = styled.button`
  background: #506ce7ff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const AdminNavButton = styled(NavButton)`
  background: linear-gradient(135deg, #e17055 0%, #fd79a8 100%);
`;

const MainContent = styled.main`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  margin: 2rem 0;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  background: #ffeaea;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
  margin: 1rem 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const DashboardCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e1e8ed;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const DashboardStat = styled.p`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #516ef0ff;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
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
`;

const Dashboard = () => {
  const { user, clearUser } = useUserStore();
  const token = useUserStore((s) => s.token);
  const navigate = useNavigate();
  console.log('Rol del usuario:', user?.role_name);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <DashboardContainer>
      <Header>
        <Title>Dashboard Farmacia GS</Title>
        <img
          src="imagenes/logo.png"
          alt="Logo Farmacia GS"
          style={{
            height: '130px',
            width: '130px',
            objectFit: 'contain',
            borderRadius: '80%',
            marginRight: '3rem',
            marginLeft: '1rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease'
          }}
        />


        <UserInfo>
          <User size={30} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          <UserName>Bienvenido, {user?.name}</UserName>
          {user?.role_name && <Role>({user.role_name})</Role>}

          <LogoutButton onClick={handleLogout}>
            Cerrar Sesión
          </LogoutButton>
        </UserInfo>
      </Header>
     

      
  <Navigation>
  {(user?.role_name === 'admin' || user?.role_name === 'pharmacist') && (
    <>
    <NavButton onClick={() => navigate('/inventory')}>Inventario</NavButton>
     <NavButton onClick={() => navigate('/prescriptions')}>Prescripciones</NavButton>
     

    </>
  )}
  {(user?.role_name === 'admin' || user?.role_name === 'cashier')  && (
    <>
    <NavButton onClick={() => navigate('/sales')}>Ventas</NavButton>
    <NavButton onClick={() => navigate('/clients')}>Clientes</NavButton>
     </>
  )}
  {user?.role_name === 'admin' && (
    <>
    
      <NavButton onClick={() => navigate('/employees')}>Empleados</NavButton>
      <NavButton onClick={() => navigate('/reports')}>Reportes</NavButton>
      <AdminNavButton onClick={() => navigate('/admin')}>Administración</AdminNavButton>
      <AdminNavButton onClick={() => navigate('/roles')}>Roles</AdminNavButton>
      <AdminNavButton onClick={() => navigate('/backups')}>Respaldos</AdminNavButton>
      {/* <AdminNavButton onClick={() => navigate('/audit')}>Auditoría</AdminNavButton> */}
    </>
  )}
</Navigation>


      <MainContent>
        {loading ? (
          <LoadingText>Cargando estadísticas...</LoadingText>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : stats ? (
          <>
            <DashboardGrid>
              <DashboardCard>
                <h3>Ventas del Día</h3>
                <DashboardStat>${stats.dailySales.toFixed(2)}</DashboardStat>
              </DashboardCard>
              <DashboardCard>
                <h3>Productos Vendidos</h3>
                <DashboardStat>{stats.productsSold}</DashboardStat>
              </DashboardCard>
              <DashboardCard>
                <h3>Clientes Atendidos</h3>
                <DashboardStat>{stats.clientsServed}</DashboardStat>
              </DashboardCard>
              <DashboardCard>
                <h3>Stock Bajo</h3>
                <DashboardStat>{stats.lowStockCount}</DashboardStat>
              </DashboardCard>
            </DashboardGrid>

            <RecentActivities>
              <h3>Actividades Recientes</h3>
              <ul>
                {stats.recentActivities.map((activity) => (
                  <li key={activity.id}>
                    <span style={{ fontWeight: 'bold' }}>{activity.action}</span> — por <em>{activity.user?.name || 'Sistema'}</em><br />
                    <small style={{ color: '#666' }}>{new Date(activity.created_at).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            </RecentActivities>
          </>
        ) : null}
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;